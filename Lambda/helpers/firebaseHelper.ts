import axios from 'axios';
import * as admin from 'firebase-admin';

import { Secrets } from '../types/secretsType';

export const getFirebaseToken = async (secrets: Secrets): Promise<string | null> => {
    const serviceAccount = {
        type: secrets.Firebase.type,
        project_id: secrets.Firebase.project_id,
        private_key_id: secrets.Firebase.private_key_id,
        private_key: secrets.Firebase.private_key?.replace(/\\n/g, "\n"), // Important for correct formatting!
        client_email: secrets.Firebase.client_email,
        client_id: secrets.Firebase.client_id,
        auth_uri: secrets.Firebase.auth_uri,
        token_uri: secrets.Firebase.token_uri,
        auth_provider_x509_cert_url: secrets.Firebase.auth_provider_x509_cert_url,
        client_x509_cert_url: secrets.Firebase.client_x509_cert_url,
        universe_domain: secrets.Firebase.universe_domain,
    };

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
    }

    const customToken = await admin.auth().createCustomToken(secrets.LambdaUID);
    
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${secrets.Firebase.web_api_key}`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    const token = response.data.idToken;
    return token;
};
