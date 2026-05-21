"use client";

import { clearCache } from "../../stores/contentCacheStore";
import { DEFAULT_AUTH_RETURN_TO, showAuthPrompt } from "../../stores/authPromptStore";

let clearUserAccountData = () => {};

export const setUserAccountDataClearer = (clearer: () => void) => {
    clearUserAccountData = clearer;
};

export const authHeader = (token?: string | null) => (
    token ? { Authorization: `Bearer ${token}` } : {}
);

export const handleAccountUnauthorized = (returnTo: string = DEFAULT_AUTH_RETURN_TO, showPrompt: boolean = false) => {
    clearUserAccountData();
    clearCache();
    if (showPrompt) {
        showAuthPrompt(returnTo);
    }
};

export default {};
