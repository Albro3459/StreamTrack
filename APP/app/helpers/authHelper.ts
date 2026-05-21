"use client";

import * as AppleAuthentication from 'expo-apple-authentication';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, GoogleAuthProvider, EmailAuthProvider, OAuthProvider, GoogleSignin, reauthenticateWithCredential, revokeAccessToken, linkWithCredential, secrets } from "../../firebaseConfig";
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
    email = email?.trim() || '';
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
        const userExists = await checkIfUserExists(token); // intentionally NOT passing error funcs
        if (userExists.status === 401) {
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const token = await user?.getIdToken() ?? null;
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else if (userExists.exists) {
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

export const AddPasswordLogin = async (
    auth: Auth,
    password: string,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>,
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    const user = auth?.currentUser;
    const email = user?.email?.trim();

    if (!user || !email) {
        if (setAlertMessageFunc) setAlertMessageFunc("Sign in with Google or Apple before adding password login");
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }

    if (password.length < 6) {
        if (setAlertMessageFunc) setAlertMessageFunc("Password must be at least 6 characters");
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }

    const providerIds = getProviderIds(auth);
    if (providerIds.includes("password")) {
        if (setAlertMessageFunc) setAlertMessageFunc("Password login is already enabled");
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Info);
        return false;
    }

    if (!providerIds.includes("apple.com") && !providerIds.includes("google.com")) {
        if (setAlertMessageFunc) setAlertMessageFunc("Sign in with Google or Apple before adding password login");
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }

    try {
        await reauthenticateCurrentUser(auth);
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);
        await user.reload();
        if (setAlertMessageFunc) setAlertMessageFunc("Password login added");
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Success);
        return true;
    } catch (e: any) {
        console.warn("Add password login failed", e);
        if (setAlertMessageFunc) {
            if (e?.code === "auth/provider-already-linked") {
                setAlertMessageFunc("Password login is already enabled");
            } else if (e?.code === "auth/credential-already-in-use" || e?.code === "auth/email-already-in-use") {
                setAlertMessageFunc("That email is already linked to another sign-in account");
            } else {
                setAlertMessageFunc(e?.message || "Add password login failed");
            }
        }
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

const getProviderIds = (auth: Auth): string[] => {
    return auth?.currentUser?.providerData?.map(provider => provider.providerId) ?? [];
};

const reauthenticateAppleUser = async (auth: Auth, revokeAccess: boolean = false) => {
    const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });

    if (!credential.identityToken || (revokeAccess && !credential.authorizationCode)) {
        throw new Error("Apple reauthentication failed");
    }

    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({ idToken: credential.identityToken });
    await reauthenticateWithCredential(auth.currentUser, firebaseCredential);
    if (revokeAccess) {
        await revokeAccessToken(auth, credential.authorizationCode);
    }
};

const reauthenticateGoogleUser = async (auth: Auth, revokeAccess: boolean = false) => {
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
    if (revokeAccess) {
        await GoogleSignin?.revokeAccess();
    }
};

const reauthenticatePasswordUser = async (auth: Auth, password?: string) => {
    const email = auth.currentUser?.email;
    if (!email || !password) {
        throw new Error("Enter your password to delete your account");
    }

    const firebaseCredential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, firebaseCredential);
};

const reauthenticateCurrentUser = async (auth: Auth, password?: string, revokeAccess: boolean = false) => {
    const providerIds = getProviderIds(auth);

    if (providerIds.includes('apple.com')) {
        await reauthenticateAppleUser(auth, revokeAccess);
    } else if (providerIds.includes('google.com')) {
        await reauthenticateGoogleUser(auth, revokeAccess);
    } else if (providerIds.includes('password')) {
        if (!password) {
            throw new Error("Enter your password to continue");
        }
        await reauthenticatePasswordUser(auth, password);
    } else {
        throw new Error("No supported sign-in provider found");
    }
};

export const DeleteAccount = async (
    auth: Auth, router: Router,
    password?: string,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    if (!auth?.currentUser) {
        if (setAlertMessageFunc) setAlertMessageFunc('No account is signed in');
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }

    try {
        await reauthenticateCurrentUser(auth, password, true);

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

export const SignUp = async (
    auth: Auth, router: Router, email: string, password: string,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!auth) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign Up auth invalid'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign Up auth failed';
        });
        return false;
    }
    email = email?.trim() || '';
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Sign Up invalid email';
        });
        return false;
    }
    let userCreds: UserCredential;
    try {
        userCreds = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
        if (e?.code === "auth/email-already-in-use") {
            if (setAlertMessageFunc) setAlertMessageFunc("Email already in use. Try sign in with Google or Apple, then add password login from Profile.");
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Info);
            return false;
        }
        throw e;
    }

    const user = userCreds?.user;
    if (user) {
        const token = await user?.getIdToken() ?? null;
        await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
        return true;
    } else {
        console.warn('Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export const AppleSignIn = async (
    userCreds: AuthUserCredential, router: Router, email: string | null | undefined,
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

    email = email?.trim() || '';
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
        const userExists = await checkIfUserExists(token);
        if (userExists.status === 401) { // intentionally NOT passing error funcs
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else if (userExists.exists) {
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
    userCreds: AuthUserCredential, router: Router, email: string | null | undefined,
    firstName?: string | null, lastName?: string | null,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign Up invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign Up invalid credentials';
        });
        return false;
    }
    email = email?.trim() || '';
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Apple Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Apple Sign Up invalid email';
        });
        return false;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        const createUserSuccess = await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        if (!createUserSuccess) return false;
        if (firstName || lastName) {
            await updateUserProfile(router, token, firstName, lastName, new Set<string>(), new Set<string>(), setAlertMessageFunc, setAlertTypeFunc);
        }
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
        return true;
    } else {
        console.warn('Apple Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Apple Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export const GoogleSignIn = async (
    userCreds: AuthUserCredential, router: Router, email: string,
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

    email = email?.trim() || '';
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
        const userExists = await checkIfUserExists(token);
        if (userExists.status === 401) { // intentionally NOT passing error funcs
            // doesnt exist in DB, but does in Firebase, so try to create the user
            const success: boolean = await createUser(router, token); // intentionally NOT passing error funcs
            if (success) {
                FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
                return true;
            }
        } else if (userExists.exists) {
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

export const GoogleSignUp = async (
    userCreds: AuthUserCredential, router: Router, email: string,
    firstName?: string | null, lastName?: string | null,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<boolean> => {
    ClearCache(CACHE.USER);
    if (!userCreds) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign Up invalid credentials'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign Up invalid credentials';
        });
        return false;
    }
    email = email?.trim() || '';
    if (!email.includes('@') || !email.includes('.')) {
        if (setAlertMessageFunc) setAlertMessageFunc(prev => {
            console.warn('Google Sign Up invalid email: ' + email); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return 'Google Sign Up invalid email';
        });
        return false;
    }

    const token = await getUserIdToken(userCreds);
    if (token) {
        const createUserSuccess = await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        if (!createUserSuccess) return false;
        if (firstName || lastName) {
            await updateUserProfile(router, token, firstName, lastName, new Set<string>(), new Set<string>(), setAlertMessageFunc, setAlertTypeFunc);
        }
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
        return true;
    } else {
        console.warn('Google Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Google Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return false;
    }
};

export default {};
