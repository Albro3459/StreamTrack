"use client";

import { create } from 'zustand';
import { PopularContentData } from '../types/dataTypes';
import { getPopularContent } from '../helpers/StreamTrack/contentHelper';
import { Alert } from '../components/alertMessageComponent';
import { Router } from 'expo-router';

// Wrappers
export const fetchPopularContent = (router: Router, token: string,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    const store = usePopularContentStore.getState();
    if (store.loading) return;
    store.fetchPopularContent(router, token, setAlertMessageFunc, setAlertTypeFunc);
};

export const clearPopularContent = () => usePopularContentStore.getState().clearUserData();

// Store
interface PopularContentStore {
    popularContent: PopularContentData | null;
    loading: boolean;
    error: string | null;
    fetchPopularContent: (router: Router, token: string,
                            setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                            setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<void>;
    clearUserData: () => void;
}

export const usePopularContentStore = create<PopularContentStore>((set) => ({
    popularContent: null,
    loading: false,
    error: null,

    fetchPopularContent: async (router: Router, token: string,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        set({ loading: true, error: null });

        const popularContent: PopularContentData = await getPopularContent(router, token);

        if (popularContent) {
            set({ popularContent: popularContent, loading: false });
        } else {
            set({ error: 'Fetch failed', loading: false });
            if (setAlertMessageFunc) setAlertMessageFunc('Fetch failed'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        }
    },

    clearUserData: () => {
        set({ popularContent: null, error: null, loading: false });
    },
}));

export default {};