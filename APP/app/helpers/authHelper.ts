"use client";

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { createUser } from "./StreamTrack/userHelper";
import { CACHE, ClearCache, FetchCache } from "./cacheHelper";
import { Alert } from "../components/alertMessageComponent";

export const SignIn = async (auth: Auth, email: string, password: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const token = await user?.getIdToken() ?? null;
    token && FetchCache(token, setAlertMessageFunc, setAlertTypeFunc);
};

export const LogOut = async (auth: Auth) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    await signOut(auth);
};

export const SignUp = async (auth: Auth, email: string, password: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    email = email?.trim();
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    const userCreds: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCreds.user;
    if (user) {
        const token = await user?.getIdToken() ?? null;
        await createUser(token, setAlertMessageFunc, setAlertTypeFunc);
        token && FetchCache(token, setAlertMessageFunc, setAlertTypeFunc);
    } else {
        console.warn('Sign Up user failed'); 
        if (setAlertMessageFunc) setAlertMessageFunc('Sign Up user failed'); 
        if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
    }
};

export default {};