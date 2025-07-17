import axios from 'axios';
import * as admin from 'firebase-admin';

import { AWSSecrets } from '../types/AWSSecretsType';

// import { FIREBASE_WEB_API_KEY, LAMBDA_UID } from '../secrets/firebase';
// const ServiceAccount = require("../secrets/FirebaseServiceAccount.json");


export const getFirebaseToken = async (secrets: AWSSecrets): Promise<string | null> => {
    const serviceAccount = {
        type: secrets.FirebaseType,
        project_id: secrets.FirebaseProjectID,
        private_key_id: secrets.FirebasePrivateKeyID,
        private_key: secrets.FirebasePrivateKey?.replace(/\\n/g, "\n"), // Important for correct formatting!
        client_email: secrets.FirebaseClientEmail,
        client_id: secrets.FirebaseClientID,
        auth_uri: secrets.FirebaseAuthURI,
        token_uri: secrets.FirebaseTokenURI,
        auth_provider_x509_cert_url: secrets.FirebaseAuthProviderx509CertUrl,
        client_x509_cert_url: secrets.FirebaseClientProviderx509CertUrl,
        universe_domain: secrets.FirebaseUniverseDomain,
    };

    console.log("PRIVATE KEY RAW: ", secrets.FirebasePrivateKey);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
    }

    const customToken = await admin.auth().createCustomToken(secrets.LambdaUID);
    
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${secrets.FirebaseWebAPIKey}`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    const token = response.data.idToken;
    return token;
};
