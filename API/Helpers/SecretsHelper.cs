using System.Text.Json;
using Oci.Common;
using Oci.Common.Auth;
using Oci.SecretsService;
using Oci.SecretsService.Models;
using Oci.SecretsService.Requests;

namespace API.Helpers;

public enum Secrets {
    PostgresUsername,
    PostgresPassword,
    LambdaUID,
    RapidAPIKey_Main,
    TMDBBearerToken
}

public static class SecretsHelper {

    private const string OCI_REGION = "OCI_REGION";
    private const string SECRET_OCID = "SECRET_OCID";
    private const string STREAMTRACK_SECRET_JSON = "STREAMTRACK_SECRET_JSON";

    public static async Task<string> GetSecretKey(Secrets secret) {
        using var doc = await GetSecretJsonDocument();
        if (doc.RootElement.TryGetProperty(secret.ToString(), out var value)) {
            return value.GetString() ?? "";
        }

        return "";
    }

    public static async Task<string> GetSecretObjectJson(string propertyName) {
        using var doc = await GetSecretJsonDocument();
        if (doc.RootElement.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.Object) {
            return value.GetRawText();
        }

        return "";
    }

    private static async Task<JsonDocument> GetSecretJsonDocument() {
        string? localSecretJson = Environment.GetEnvironmentVariable(STREAMTRACK_SECRET_JSON);
        if (!string.IsNullOrWhiteSpace(localSecretJson)) {
            return JsonDocument.Parse(localSecretJson);
        }

        string region = Environment.GetEnvironmentVariable(OCI_REGION)
            ?? throw new InvalidOperationException($"Missing required environment variable {OCI_REGION}.");
        string secretOcid = Environment.GetEnvironmentVariable(SECRET_OCID)
            ?? throw new InvalidOperationException($"Missing required environment variable {SECRET_OCID}.");

        var provider = new InstancePrincipalsAuthenticationDetailsProvider();
        using var client = new SecretsClient(provider, new ClientConfiguration());
        client.SetRegion(Region.FromRegionId(region));

        var request = new GetSecretBundleRequest { SecretId = secretOcid };
        var response = await client.GetSecretBundle(request);

        if (response.SecretBundle?.SecretBundleContent is Base64SecretBundleContentDetails bundleContent) {
            string secretJson = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(bundleContent.Content));
            return JsonDocument.Parse(secretJson);
        }

        return JsonDocument.Parse("{}");
    }
}
