using System.Text.Json;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

namespace API.Helpers;

public enum AWS_Secrets {
    PostgresUsername,
    PostgresPassword,
    LambdaUID,
    RapidAPIKey_Main,
    TMDBBearerToken
}

public static class AWSSecretHelper {

    private const string SecretName = "StreamTrack";
    private const string Region = "us-west-1";
    public static async Task<string> GetSecretKey(AWS_Secrets secret) {
        var config = new AmazonSecretsManagerConfig { RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(Region) };
        var client = new AmazonSecretsManagerClient(config);

        var request = new GetSecretValueRequest { SecretId = SecretName };
        var response = await client.GetSecretValueAsync(request);

        // Parse the secret as JSON
        using var doc = JsonDocument.Parse(response.SecretString);
        if (doc.RootElement.TryGetProperty(secret.ToString(), out var value)) {
            return value.GetString() ?? "";
        }
        return "";
    }
}
