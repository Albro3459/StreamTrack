import { create } from 'zustand';
import { PopularContentData } from '../types/dataTypes';
import { getPopularContent } from '../helpers/StreamTrack/contentHelper';

// Wrappers
export const fetchPopularContent = (token: string) => {
    const store = usePopularContentStore.getState();
    if (store.loading) return;
    store.fetchPopularContent(token);
};

export const clearPopularContent = () => usePopularContentStore.getState().clearUserData();

// Store
interface PopularContentStore {
    popularContent: PopularContentData | null;
    loading: boolean;
    error: string | null;
    fetchPopularContent: (token: string) => Promise<void>;
    clearUserData: () => void;
}

export const usePopularContentStore = create<PopularContentStore>((set) => ({
    popularContent: null,
    loading: false,
    error: null,

    fetchPopularContent: async (token: string) => {
        set({ loading: true, error: null });

        const popularContent: PopularContentData = await getPopularContent(token);

        if (popularContent) {
            set({ popularContent: popularContent, loading: false });
        } else {
            set({ error: 'Fetch failed', loading: false });
        }
    },

    clearUserData: () => {
        set({ popularContent: null, error: null, loading: false });
    },
}));

export default {};