export type Secrets = {
    RapidAPIKey_Lambda?: string;
    TMDBBearerToken?: string;
    LambdaUID?: string;
    Firebase: {
        web_api_key: string;
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
        universe_domain: string;
    }
};