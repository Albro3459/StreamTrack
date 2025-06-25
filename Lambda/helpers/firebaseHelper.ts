import axios from 'axios';
import * as admin from 'firebase-admin';

import { FIREBASE_WEB_API_KEY, LAMBDA_UID } from '../secrets/firebase';
const ServiceAccount = require("../secrets/FirebaseServiceAccount.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(ServiceAccount),
    });
}

export const getFirebaseToken = async (): Promise<string | null> => {
    const customToken = await admin.auth().createCustomToken(LAMBDA_UID);
    
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_WEB_API_KEY}`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    const token = response.data.idToken;
    return token;
};
