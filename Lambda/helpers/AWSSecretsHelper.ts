import { AWSSecrets } from "../types/AWSSecretsType";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "StreamTrack";
const REGION = "us-west-1";

export async function getAllSecrets(): Promise<AWSSecrets> {
    const client = new SecretsManagerClient({ region: REGION });
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);

    if (response.SecretString) {
        return JSON.parse(response.SecretString) as AWSSecrets;
    }
    throw new Error("No secret string returned");
}
