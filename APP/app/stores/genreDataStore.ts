"use client";

import { create } from 'zustand';
import { getGenreData } from '../helpers/StreamTrack/genreHelper';
import { GenreData } from '../types/dataTypes';
import { Alert } from '../components/alertMessageComponent';

interface GenreDataStore {
    genreData: GenreData[] | null;
    loading: boolean;
    error: string | null;
    fetchGenreData: (token: string,
                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<void>;
    clearGenreData: () => void;
}

export const fetchGenreData = (token: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    const store = useGenreDataStore.getState();
    if (store.loading) return;
    store.fetchGenreData(token, setAlertMessageFunc, setAlertTypeFunc);
};
export const clearGenreData = () => useGenreDataStore.getState().clearGenreData();

export const useGenreDataStore = create<GenreDataStore>((set) => ({
    genreData: null,
    loading: false,
    error: null,

    fetchGenreData: async (token: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => {
        set({ loading: true, error: null });

        const result: GenreData[] | null = await getGenreData(token);

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