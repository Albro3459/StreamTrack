using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.OpenApi.Models;
using System.Net;

using API.Infrastructure;
using API.Service;
using API.Helpers;
using API.Pages;

var builder = WebApplication.CreateBuilder(args);

// DB Connection
var usernameTask = SecretsHelper.GetSecretKey(Secrets.PostgresUsername);
var passwordTask = SecretsHelper.GetSecretKey(Secrets.PostgresPassword);
await Task.WhenAll(usernameTask, passwordTask);

var baseConnectionString = builder.Configuration.GetConnectionString("Default") ?? "";
var connectionString = baseConnectionString
    .Replace("Username=;", $"Username={usernameTask.Result};")
    .Replace("Password=;", $"Password={passwordTask.Result};");

builder.Services.AddDbContext<StreamTrackDbContext>(
    options => options.UseNpgsql(connectionString)
);

// SQLite
// builder.Services.AddDbContext<StreamTrackDbContext>(options =>
//     options.UseSqlite(builder.Configuration.GetConnectionString("Development"))
// );

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "StreamTrack", Version = "v1" });

    // Add JWT bearer security definition
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    // Apply Bearer Auth globally
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Auth
builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Bearer", _ => { });

// Require authentication globally for all controllers
builder.Services.AddAuthorization(options => {
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});


builder.Services.AddAutoMapper(cfg => { }, typeof(Program).Assembly); // All profiles in this project

// Services
builder.Services.AddScoped<HelperService>();
builder.Services.AddScoped<PosterService>();
builder.Services.AddScoped<PopularSortingService>();
builder.Services.AddSingleton<FirebaseAdminService>();

// TMDB's CloudFront path has returned malformed gzip bodies over HTTP/1.1 from the OCI VM so using HTTP/2 because it keeps decompression reliable
builder.Services.AddHttpClient(APIService.TMDBHttpClientName, client => {
    client.DefaultRequestVersion = HttpVersion.Version20;
    client.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrHigher;
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler {
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli
});
builder.Services.AddHttpClient<APIService>().ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler {
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli
});

builder.Services.AddSingleton<BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ORDER MATTERS

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapGet("/privacy-policy", (IWebHostEnvironment environment) =>
        Results.Content(PrivacyPolicyPage.ReadHtml(environment), "text/html; charset=utf-8"))
    .AllowAnonymous();

app.MapControllers();

app.Run();
