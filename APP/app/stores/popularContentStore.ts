"use client";

import { create } from 'zustand';
import { PopularContentData } from '../types/dataTypes';
import { getPopularContent } from '../helpers/StreamTrack/contentHelper';
import { Alert } from '../components/alertMessageComponent';

// Wrappers
export const fetchPopularContent = (token: string,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    const store = usePopularContentStore.getState();
    if (store.loading) return;
    store.fetchPopularContent(token, setAlertMessageFunc, setAlertTypeFunc);
};

export const clearPopularContent = () => usePopularContentStore.getState().clearUserData();

// Store
interface PopularContentStore {
    popularContent: PopularContentData | null;
    loading: boolean;
    error: string | null;
    fetchPopularContent: (token: string,
                            setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                            setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<void>;
    clearUserData: () => void;
}

export const usePopularContentStore = create<PopularContentStore>((set) => ({
    popularContent: null,
    loading: false,
    error: null,

    fetchPopularContent: async (token: string,
                                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        set({ loading: true, error: null });

        const popularContent: PopularContentData = await getPopularContent(token);

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