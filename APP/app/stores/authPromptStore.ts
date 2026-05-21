"use client";

import { create } from "zustand";

interface AuthPromptStore {
    visible: boolean;
    returnTo: string;
    showAuthPrompt: (returnTo?: string) => void;
    hideAuthPrompt: () => void;
}

export const DEFAULT_AUTH_RETURN_TO = "/LandingPage";

export const useAuthPromptStore = create<AuthPromptStore>((set) => ({
    visible: false,
    returnTo: DEFAULT_AUTH_RETURN_TO,
    showAuthPrompt: (returnTo: string = DEFAULT_AUTH_RETURN_TO) => set({ visible: true, returnTo }),
    hideAuthPrompt: () => set({ visible: false }),
}));

export const showAuthPrompt = (returnTo: string = DEFAULT_AUTH_RETURN_TO) => {
    useAuthPromptStore.getState().showAuthPrompt(returnTo);
};

export const hideAuthPrompt = () => {
    useAuthPromptStore.getState().hideAuthPrompt();
};

export default {};
