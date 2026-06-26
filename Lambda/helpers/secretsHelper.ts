import { Secrets } from "../types/secretsType";

const ENV_VAR = "STREAMTRACK_SECRETS";

export async function getAllSecrets(): Promise<Secrets> {
    const raw = process.env[ENV_VAR];
    if (!raw) throw new Error(`${ENV_VAR} env var not set`);
    return JSON.parse(raw) as Secrets;
}
