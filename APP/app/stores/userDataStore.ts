"use client";

import { create } from 'zustand';
import { ContentPartialData, UserData, UserMinimalData } from '../types/dataTypes';
import { getUserContents, getUserMinimalData } from '../helpers/StreamTrack/userHelper';
import { Alert } from '../components/alertMessageComponent';
import { Router } from 'expo-router';
import { setUserAccountDataClearer } from '../helpers/StreamTrack/authApiHelper';

let userDataFetchPromise: Promise<UserData | null> | null = null;
let userDataFetchVersion = 0;

// Wrappers
export const fetchUserData = (
    router: Router, token: string,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>,
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<UserData | null> => {
    const store = useUserDataStore.getState();
    if (userDataFetchPromise) return userDataFetchPromise;

    userDataFetchPromise = store.fetchUserData(router, token, setAlertMessageFunc, setAlertTypeFunc)
        .finally(() => {
            userDataFetchPromise = null;
        });
    return userDataFetchPromise;
};

export const ensureUserDataLoaded = (router: Router, token: string | null,
    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>,
    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
): Promise<UserData | null> => {
    if (!token) return Promise.resolve(null);
    const store = useUserDataStore.getState();
    if (store.userData) return Promise.resolve(store.userData);
    return fetchUserData(router, token, setAlertMessageFunc, setAlertTypeFunc);
};

export const clearUserData = () => {
    userDataFetchVersion++;
    userDataFetchPromise = null;
    useUserDataStore.getState().clearUserData();
};

export const setUserData = (data: UserData, force: boolean = false) => {
    const store = useUserDataStore.getState();
    if (!force && store.loading) return;
    userDataFetchVersion++;
    userDataFetchPromise = null;
    store.clearUserData();
    store.setUserData(data);
}

// Store
interface UserDataStore {
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    fetchUserData: (router: Router, token: string,
        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>,
        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<UserData | null>;
    clearUserData: () => void;
    setUserData: (data: UserData) => void;
}

export const useUserDataStore = create<UserDataStore>((set) => ({
    userData: null,
    loading: false,
    error: null,

    fetchUserData: async (router: Router, token: string,
        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>,
        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        const fetchVersion = userDataFetchVersion;
        set({ loading: true, error: null });

        const userMinimalData: UserMinimalData | null = await getUserMinimalData(router, token, setAlertMessageFunc, setAlertTypeFunc);
        const contentMinimalData: ContentPartialData[] | null = await getUserContents(router, token, setAlertMessageFunc, setAlertTypeFunc);

        if (fetchVersion !== userDataFetchVersion) {
            return null;
        }

        if (userMinimalData && contentMinimalData) {
            const userData = { user: userMinimalData, contents: contentMinimalData } satisfies UserData;
            set({ userData: userData, loading: false });
            return userData;
        } else {
            set({ error: 'Fetch failed', loading: false });
            if (setAlertMessageFunc) setAlertMessageFunc('Fetch failed');
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
            return null;
        }
    },

    clearUserData: () => {
        set({ userData: null, error: null, loading: false });
    },

    setUserData: (data: UserData) => set({ userData: data, loading: false })
}));

setUserAccountDataClearer(clearUserData);

export default {};
