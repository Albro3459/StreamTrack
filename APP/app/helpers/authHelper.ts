"use client";

import * as AppleAuthentication from 'expo-apple-authentication';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, GoogleAuthProvider, OAuthProvider, GoogleSignin, reauthenticateWithCredential, revokeAccessToken, secrets } from "../../firebaseConfig";
import { checkIfUserExists, createUser, deleteUserAccount, updateUserProfile } from "./StreamTrack/userHelper";
import { CACHE, ClearCache, FetchCache } from "./cacheHelper";
import { Alert } from "../components/alertMessageComponent";
import { Router } from "expo-router";
import { AuthUserCredential } from "../types/AuthUserCredential";

const getUserIdToken = async (userCreds: AuthUserCredential): Promise<string | null> => {
    return await userCreds?.user?.getIdToken() ?? null;
};

export const SignIn = async (auth: Auth, router: Router, email: string, password: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) : Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!auth) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign In auth invalid'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign In auth failed';
        });
        return false;
    }
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign In invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign In invalid email';
        });
        return false;
    }
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const token = await user?.getIdToken() ?? null;
    if (token) {
        if (!await checkIfUserExists(token)) { // intentionally NOT passing error funcs
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const token = await user?.getIdToken() ?? null;
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else {
            FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
            return true;
        }
    }
    if (setAlertMessageFunc) setAlertMessageFunc(prev => {
        console.warn('Sign In redirect to Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return 'Sign In failed';
    });
    return false;
};

export const LogOut = async (auth: Auth) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    await signOut(auth);
};

const getProviderIds = (auth: Auth): string[] => {
    return auth?.currentUser?.providerData?.map(provider => provider.providerId) ?? [];
};

const reauthenticateAppleUser = async (auth: Auth) => {
    const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });

    if (!credential.identityToken || !credential.authorizationCode) {
        throw new Error("Apple reauthentication failed");
    }

    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({ idToken: credential.identityToken });
    await reauthenticateWithCredential(auth.currentUser, firebaseCredential);
    await revokeAccessToken(auth, credential.authorizationCode);
};

const reauthenticateGoogleUser = async (auth: Auth) => {
    GoogleSignin?.configure({
        webClientId: secrets.webClientID,
        iosClientId: secrets.iosClientID,
        offlineAccess: true,
        scopes: ["profile", "email"],
    });
    await GoogleSignin?.hasPlayServices();
    const userInfo = await GoogleSignin?.signIn();
    if (userInfo?.type === "cancelled") {
        throw new Error("Google reauthentication cancelled");
    }

    const idToken = userInfo?.data?.idToken;
    if (!idToken) {
        throw new Error("Google reauthentication failed");
    }

    const firebaseCredential = GoogleAuthProvider.credential(idToken);
    await reauthenticateWithCredential(auth.currentUser, firebaseCredential);
    await GoogleSignin?.revokeAccess();
};

export const DeleteAccount = async (
    auth: Auth, router: Router,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    if (!auth?.currentUser) {
        if (setAlertMessageFunc) setAlertMessageFunc('No account is signed in');
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }

    try {
        const providerIds = getProviderIds(auth);

        if (providerIds.includes('apple.com')) {
            await reauthenticateAppleUser(auth);
        } else if (providerIds.includes('google.com')) {
            await reauthenticateGoogleUser(auth);
        }

        const token = await auth.currentUser.getIdToken(true);
        const streamTrackDeleted = await deleteUserAccount(router, token, setAlertMessageFunc, setAlertTypeFunc);
        if (!streamTrackDeleted) return false;

        ClearCache(CACHE.ALL);
        await signOut(auth);
        router.replace('/LoginPage');
        return true;
    } catch (e: any) {
        const cancelCodes = ["ERR_REQUEST_CANCELED", "ERR_CANCELED", "ERR_REQUEST_UNKNOWN"];
        if (!cancelCodes.includes(e?.code)) {
            console.warn("Delete account failed", e);
            if (setAlertMessageFunc) setAlertMessageFunc(e?.message || 'Delete account failed');
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        }
        return false;
    }
};

export const SignUp = async (auth: Auth, router: Router, email: string, password: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    ClearCache(CACHE.USER);
    if (!auth) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign Up auth invalid'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign Up auth failed';
        });
        return;
    }
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign Up invalid email';
        });
        return;
    }
    const userCreds: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCreds.user;
    if (user) {
        const token = await user?.getIdToken() ?? null;
        await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
    } else {
        console.warn('Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export const AppleSignIn = async (userCreds: AuthUserCredential, router: Router, email: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) : Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign In invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign In invalid credentials';
        });
        return false;
    }

    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign In invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign In invalid email';
        });
        return false;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        if (!await checkIfUserExists(token)) { // intentionally NOT passing error funcs
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else {
            FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
            return true;
        }
    } 

    if (setAlertMessageFunc) setAlertMessageFunc(prev => {
        console.warn('Apple Sign In redirect to Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return 'Apple Sign In failed';
    });
    return false;
};

export const AppleSignUp = async (
    userCreds: AuthUserCredential, router: Router, email: string,
    firstName?: string | null,
    lastName?: string | null,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign Up invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign Up invalid credentials';
        });
        return;
    }
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign Up invalid email';
        });
        return;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        if (firstName || lastName) {
            await updateUserProfile(router, token, firstName, lastName, new Set<string>(), new Set<string>(), setAlertMessageFunc, setAlertTypeFunc);
        }
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
    } else {
        console.warn('Apple Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Apple Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export const GoogleSignIn = async (userCreds: AuthUserCredential, router: Router, email: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) : Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign In invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign In invalid credentials';
        });
        return false;
    }

    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign In invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign In invalid email';
        });
        return false;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        if (!await checkIfUserExists(token)) { // intentionally NOT passing error funcs
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else {
            FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
            return true;
        }
    } 

    if (setAlertMessageFunc) setAlertMessageFunc(prev => {
        console.warn('Google Sign In redirect to Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return 'Google Sign In failed';
    });
    return false;
};

export const GoogleSignUp = async (userCreds: AuthUserCredential, router: Router, email: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign Up invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign Up invalid credentials';
        });
        return;
    }
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign Up invalid email';
        });
        return;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
    } else {
        console.warn('Google Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Google Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export default {};
