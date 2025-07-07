"use client";

import { create } from 'zustand';
import { getGenreData } from '../helpers/StreamTrack/genreHelper';
import { GenreData } from '../types/dataTypes';
import { Alert } from '../components/alertMessageComponent';
import { Router } from 'expo-router';

interface GenreDataStore {
    genreData: GenreData[] | null;
    loading: boolean;
    error: string | null;
    fetchGenreData: (router: Router, token: string,
                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<void>;
    clearGenreData: () => void;
}

export const fetchGenreData = (router: Router, token: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    const store = useGenreDataStore.getState();
    if (store.loading) return;
    store.fetchGenreData(router, token, setAlertMessageFunc, setAlertTypeFunc);
};
export const clearGenreData = () => useGenreDataStore.getState().clearGenreData();

export const useGenreDataStore = create<GenreDataStore>((set) => ({
    genreData: null,
    loading: false,
    error: null,

    fetchGenreData: async (router: Router, token: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        set({ loading: true, error: null });

        const result: GenreData[] | null = await getGenreData(router, token);

        if (result) {
            set({ genreData: result, loading: false });
        } else {
            set({ error: 'Fetch failed', loading: false });
            if (setAlertMessageFunc) setAlertMessageFunc('Fetch failed'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        }
    },

    clearGenreData: () => {
        set({ genreData: null, error: null, loading: false });
    },
}));

export default {};