using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace API.Helpers;

public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions> {
    private readonly IConfiguration configuration;
    private readonly IHttpClientFactory httpClientFactory;
    private static IReadOnlyCollection<SecurityKey> cachedSigningKeys = Array.Empty<SecurityKey>();
    private static DateTimeOffset signingKeysExpireAt = DateTimeOffset.MinValue;
    private static readonly SemaphoreSlim signingKeysLock = new(1, 1);
    private const string FirebaseCertsUrl = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory
    ) : base(options, logger, encoder) {
        this.configuration = configuration;
        this.httpClientFactory = httpClientFactory;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync() {
        string? authorization = Request.Headers.Authorization.FirstOrDefault();

        if (string.IsNullOrWhiteSpace(authorization) ||
            !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) {
            return AuthenticateResult.NoResult();
        }

        string token = authorization["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token)) {
            return AuthenticateResult.Fail("Missing bearer token.");
        }

        var firebase = configuration.GetSection("Firebase");
        string? audience = firebase["Audience"];
        string? issuer = firebase["Issuer"];

        if (string.IsNullOrWhiteSpace(audience) || string.IsNullOrWhiteSpace(issuer)) {
            return AuthenticateResult.Fail("Firebase authentication is not configured correctly.");
        }

        try {
            var tokenHandler = new JsonWebTokenHandler();
            var validationResult = await tokenHandler.ValidateTokenAsync(token, new TokenValidationParameters {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                RequireSignedTokens = true,
                IssuerSigningKeys = await GetSigningKeysAsync()
            });

            if (!validationResult.IsValid || validationResult.ClaimsIdentity == null) {
                return AuthenticateResult.Fail(validationResult.Exception ?? new InvalidOperationException("Firebase token validation failed."));
            }

            var claims = validationResult.ClaimsIdentity.Claims.ToList();
            string? subject = claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub || c.Type == "sub")?.Value;
            string? email = claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email || c.Type == "email")?.Value;

            if (!string.IsNullOrWhiteSpace(subject) && !claims.Any(c => c.Type == ClaimTypes.NameIdentifier)) {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, subject));
                claims.Add(new Claim(ClaimTypes.Name, subject));
            }
            if (!string.IsNullOrWhiteSpace(email) && !claims.Any(c => c.Type == ClaimTypes.Email)) {
                claims.Add(new Claim(ClaimTypes.Email, email));
            }

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            Logger.LogInformation(
                "Firebase authentication succeeded for {Method} {Path}. NameIdentifier: {NameIdentifier}",
                Request.Method,
                Request.Path,
                subject
            );

            return AuthenticateResult.Success(ticket);
        } catch (Exception ex) {
            Logger.LogError(ex, "Firebase authentication failed for {Method} {Path}", Request.Method, Request.Path);
            return AuthenticateResult.Fail(ex);
        }
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties) {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.Headers.WWWAuthenticate = "Bearer error=\"invalid_token\", error_description=\"The signature key was not found\"";

        Logger.LogWarning(
            "Firebase challenge triggered for {Method} {Path}",
            Request.Method,
            Request.Path
        );

        return Task.CompletedTask;
    }

    protected override Task HandleForbiddenAsync(AuthenticationProperties properties) {
        Logger.LogWarning(
            "Firebase forbidden for {Method} {Path}. User authenticated: {IsAuthenticated}. NameIdentifier: {NameIdentifier}",
            Request.Method,
            Request.Path,
            Context.User.Identity?.IsAuthenticated ?? false,
            Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        );
        return base.HandleForbiddenAsync(properties);
    }

    private async Task<IReadOnlyCollection<SecurityKey>> GetSigningKeysAsync() {
        if (DateTimeOffset.UtcNow < signingKeysExpireAt && cachedSigningKeys.Count > 0) {
            return cachedSigningKeys;
        }

        await signingKeysLock.WaitAsync(Context.RequestAborted);
        try {
            if (DateTimeOffset.UtcNow < signingKeysExpireAt && cachedSigningKeys.Count > 0) {
                return cachedSigningKeys;
            }

            using var client = httpClientFactory.CreateClient();
            using var response = await client.GetAsync(FirebaseCertsUrl, Context.RequestAborted);
            response.EnsureSuccessStatusCode();

            var certMap = JsonSerializer.Deserialize<Dictionary<string, string>>(
                await response.Content.ReadAsStringAsync(Context.RequestAborted)
            ) ?? new Dictionary<string, string>();

            cachedSigningKeys = certMap.Values
                .Select(cert => new X509SecurityKey(X509Certificate2.CreateFromPem(cert)))
                .Cast<SecurityKey>()
                .ToArray();

            signingKeysExpireAt = DateTimeOffset.UtcNow.AddMinutes(60);
            if (response.Headers.CacheControl?.MaxAge is TimeSpan maxAge) {
                signingKeysExpireAt = DateTimeOffset.UtcNow.Add(maxAge);
            }

            return cachedSigningKeys;
        } finally {
            signingKeysLock.Release();
        }
    }
}
