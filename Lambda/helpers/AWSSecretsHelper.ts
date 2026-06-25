import { AWSSecrets } from "../types/AWSSecretsType";

const ENV_VAR = "STREAMTRACK_SECRETS";

export async function getAllSecrets(): Promise<AWSSecrets> {
    const raw = process.env[ENV_VAR];
    if (!raw) throw new Error(`${ENV_VAR} env var not set`);
    return JSON.parse(raw) as AWSSecrets;
}
