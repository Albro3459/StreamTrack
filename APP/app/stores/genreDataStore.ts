import { create } from 'zustand';
import { getGenreData } from '../helpers/StreamTrack/genreHelper';
import { GenreData } from '../types/dataTypes';

interface GenreDataStore {
    genreData: GenreData[] | null;
    loading: boolean;
    error: string | null;
    fetchGenreData: (token: string) => Promise<void>;
    clearGenreData: () => void;
}

export const fetchGenreData = (token: string) => {
    const store = useGenreDataStore.getState();
    if (store.loading) return;
    store.fetchGenreData(token);
};
export const clearGenreData = () => useGenreDataStore.getState().clearGenreData();

export const useGenreDataStore = create<GenreDataStore>((set) => ({
    genreData: null,
    loading: false,
    error: null,

    fetchGenreData: async (token: string) => {
        set({ loading: true, error: null });

        const result: GenreData[] | null = await getGenreData(token);

        if (result) {
            set({ genreData: result, loading: false });
        } else {
            set({ error: 'Fetch failed', loading: false });
        }
    },

    clearGenreData: () => {
        set({ genreData: null, error: null, loading: false });
    },
}));

export default {};