export type AuthUserCredential = {
  user: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string;
    isAnonymous: boolean;
    providerData: Array<{
      providerId: string;
      uid: string;
      displayName: string | null;
      email: string | null;
      phoneNumber: string | null;
      photoURL: string | null;
    }>;
    stsTokenManager: {
      refreshToken: string;
      accessToken: string;
      expirationTime: number;
    };
    createdAt: string;
    lastLoginAt: string;
    apiKey: string;
    appName: string;
  };
  providerId: string;
  _tokenResponse: {
    federatedId: string;
    providerId: string;
    email: string;
    emailVerified: boolean;
    localId: string;
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    oauthIdToken: string;
    rawUserInfo: string;
    isNewUser?: boolean; // might not be present for returning users
    kind: string;
    pendingToken: string;
  };
  operationType: string;
};

export default {};