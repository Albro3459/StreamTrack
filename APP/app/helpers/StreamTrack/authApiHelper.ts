"use client";

import { clearCache } from "../../stores/contentCacheStore";
import { DEFAULT_AUTH_RETURN_TO, showAuthPrompt } from "../../stores/authPromptStore";
import { auth, signOut } from "../../../firebaseConfig";

// Have to do this BS because of circular deps. 
// userDataStore -> userHelper -> authApiHelper -> userDataStore
let clearUserAccountData = () => {};
export const setUserAccountDataClearer = (clearer: () => void) => {
    clearUserAccountData = clearer;
};

export const authHeader = (token?: string | null) => (
    token ? { Authorization: `Bearer ${token}` } : {}
);

export const handleAccountUnauthorized = async (returnTo: string = DEFAULT_AUTH_RETURN_TO, showPrompt: boolean = false) => {
    clearUserAccountData();
    clearCache();
    if (auth.currentUser) {
        try {
            await signOut(auth);
        } catch (e: any) {
            console.warn("Firebase sign out after unauthorized account failed", e);
        }
    }
    if (showPrompt) {
        showAuthPrompt(returnTo);
    }
};

export default {};
