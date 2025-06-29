import { create } from 'zustand';
import { ContentData } from '../types/dataTypes';

interface ContentDataStore {
    contentCache: ContentData[];
    cacheContent: (content: ContentData) => void;
    clearContentCache: () => void;
}

export const getCachedContent = (tmdbID: string): ContentData | null => {
    const store = useContentDataStore.getState();
    const recent: ContentData[] = store.contentCache;
    return recent.find(c => c.tmdbID === tmdbID);
};

export const clearContentCache = () : void => {
    const store = useContentDataStore.getState();
    store.clearContentCache();
};

export const useContentDataStore = create<ContentDataStore>((set, get) => ({
    contentCache: [],

    cacheContent: (content: ContentData) => {
        const recent: ContentData[] = get().contentCache;

        const filtered = recent.filter(c => c.tmdbID !== content.tmdbID); // Remove duplicates

        const updated = [content, ...filtered].slice(0, 15); // Put it at the front and only keep first n items
        
        set({contentCache: updated});
    },

    clearContentCache: () => {
        set({contentCache: []});
    }
}));

export default {};