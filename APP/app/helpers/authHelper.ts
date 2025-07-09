"use client";

import { Auth, createUserWithEmailAndPassword, Google, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut, UserCredential } from "@/firebaseConfig"
import { checkIfUserExists, createUser } from "./StreamTrack/userHelper";
import { CACHE, ClearCache, FetchCache } from "./cacheHelper";
import { Alert } from "../components/alertMessageComponent";
import { Router } from "expo-router";

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

export const GoogleSignIn = async (userCreds: UserCredential, router: Router, email: string,
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

    const user = userCreds.user;
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
        console.warn('Google Sign In redirect to Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        return 'Google Sign In failed';
    });
    return false;
};

export const GoogleSignUp = async (userCreds: UserCredential, router: Router, email: string,
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

    const user = userCreds.user;
    if (user) {
        const token = await user?.getIdToken() ?? null;
        await createUser(router, token, setAlertMessageFunc, setAlertTypeFunc);
        token && FetchCache(router, token, setAlertMessageFunc, setAlertTypeFunc);
    } else {
        console.warn('Google Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Google Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export default {};