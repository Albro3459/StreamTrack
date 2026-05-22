"use client";

import { Router } from "expo-router";
import { auth } from "../../../firebaseConfig";
import { DEFAULT_AUTH_RETURN_TO, showAuthPrompt } from "../../stores/authPromptStore";
import { useUserDataStore } from "../../stores/userDataStore";
export { authHeader, handleAccountUnauthorized } from "./authApiHelper";

export const hasAccount = () => !!auth.currentUser && !!useUserDataStore.getState().userData;

export const requireAccount = (returnTo: string = DEFAULT_AUTH_RETURN_TO) => {
    if (hasAccount()) return true;
    showAuthPrompt(returnTo);
    return false;
};

export const getCurrentUserToken = async () => {
    return await auth.currentUser?.getIdToken() ?? null;
};

export const normalizeReturnTo = (returnTo: string | string[] | null | undefined): string | null => {
    const target = Array.isArray(returnTo) ? returnTo[0] : returnTo;
    return target;
}

export const getPostSignUpReturnTo = (rawReturnTo: string | string[] | null | undefined): string => {
    const returnTo: string | null = normalizeReturnTo(rawReturnTo);
    if (returnTo?.startsWith("/ProfilePage")) {
        return DEFAULT_AUTH_RETURN_TO;
    }
    return returnTo || DEFAULT_AUTH_RETURN_TO;
};

export const navigateToReturnTo = (router: Router, rawReturnTo?: string | string[] | null | undefined) => {
    const returnTo: string | null = normalizeReturnTo(rawReturnTo);
    router.replace((returnTo || DEFAULT_AUTH_RETURN_TO) as any);
};

export default {};
