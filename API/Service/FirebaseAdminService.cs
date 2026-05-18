using API.Helpers;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using System.Text.Json;

namespace API.Service;

public class FirebaseAdminService {
    private static readonly SemaphoreSlim InitLock = new(1, 1);
    private static bool initialized = false;
    private readonly ILogger<FirebaseAdminService> logger;

    public FirebaseAdminService(ILogger<FirebaseAdminService> logger) {
        this.logger = logger;
    }

    public async Task DeleteUserAsync(string uid) {
        await EnsureInitializedAsync();
        await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
    }

    public async Task DeleteUserIfExistsAsync(string uid) {
        const int maxAttempts = 3;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await DeleteUserAsync(uid);
                return;
            }
            catch (FirebaseAuthException ex) when (IsUserNotFound(ex)) {
                logger.LogInformation("Firebase user {Uid} was already deleted.", uid);
                return;
            }
            catch (Exception ex) when (attempt == maxAttempts) {
                logger.LogError(ex, "Firebase user delete failed for {Uid} after {MaxAttempts} attempts.", uid, maxAttempts);
                throw;
            }
            catch (Exception ex) when (attempt < maxAttempts) {
                logger.LogWarning(ex, "Firebase user delete failed for {Uid}. Attempt {Attempt} of {MaxAttempts}.", uid, attempt, maxAttempts);
                await Task.Delay(TimeSpan.FromMilliseconds(250 * attempt));
            }
        }
    }

    private static async Task EnsureInitializedAsync() {
        if (initialized && FirebaseApp.DefaultInstance != null) {
            return;
        }

        await InitLock.WaitAsync();
        try {
            if (initialized && FirebaseApp.DefaultInstance != null) {
                return;
            }

            string serviceAccountJson = await GetFirebaseServiceAccountJson();
            if (string.IsNullOrWhiteSpace(serviceAccountJson)) {
                throw new InvalidOperationException("Missing Firebase service account secret.");
            }

            FirebaseApp.Create(new AppOptions {
                Credential = GoogleCredential.FromJson(serviceAccountJson)
            });

            initialized = true;
        }
        finally {
            InitLock.Release();
        }
    }

    private static async Task<string> GetFirebaseServiceAccountJson() {
        string firebaseServiceAccount = await SecretsHelper.GetSecretObjectJson("Firebase");
        if (string.IsNullOrWhiteSpace(firebaseServiceAccount)) {
            return "";
        }

        using var doc = JsonDocument.Parse(firebaseServiceAccount);
        JsonElement root = doc.RootElement;

        var serviceAccount = new Dictionary<string, string?> {
            ["type"] = GetString(root, "type"),
            ["project_id"] = GetString(root, "project_id"),
            ["private_key_id"] = GetString(root, "private_key_id"),
            ["private_key"] = GetString(root, "private_key")?.Replace("\\n", "\n"),
            ["client_email"] = GetString(root, "client_email"),
            ["client_id"] = GetString(root, "client_id"),
            ["auth_uri"] = GetString(root, "auth_uri"),
            ["token_uri"] = GetString(root, "token_uri"),
            ["auth_provider_x509_cert_url"] = GetString(root, "auth_provider_x509_cert_url"),
            ["client_x509_cert_url"] = GetString(root, "client_x509_cert_url"),
            ["universe_domain"] = GetString(root, "universe_domain")
        };

        return JsonSerializer.Serialize(serviceAccount);
    }

    private static string? GetString(JsonElement root, string propertyName) {
        return root.TryGetProperty(propertyName, out JsonElement value) ? value.GetString() : null;
    }

    private static bool IsUserNotFound(FirebaseAuthException ex) {
        return ex.AuthErrorCode == AuthErrorCode.UserNotFound
            || ex.Message.Contains("USER_NOT_FOUND", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase);
    }
}
