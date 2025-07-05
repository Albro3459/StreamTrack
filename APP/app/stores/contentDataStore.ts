"use client";

import { create } from 'zustand';
import { ContentInfoData } from '../types/dataTypes';

interface ContentDataStore {
    contentCache: ContentInfoData[];
    cacheContent: (info: ContentInfoData) => void;
    clearContentCache: () => void;
}

export const getCachedContent = (tmdbID: string): ContentInfoData | null => {
    const store = useContentDataStore.getState();
    const recent: ContentInfoData[] = store.contentCache;
    return recent.find(c => c.content.tmdbID === tmdbID);
};

export const clearContentCache = () : void => {
    const store = useContentDataStore.getState();
    store.clearContentCache();
};

export const useContentDataStore = create<ContentDataStore>((set, get) => ({
    contentCache: [],

    cacheContent: (info: ContentInfoData) => {
        const recent: ContentInfoData[] = get().contentCache;

        const filtered = recent.filter(c => c.content.tmdbID !== info.content.tmdbID); // Remove duplicates

        const updated = [info, ...filtered].slice(0, 15); // Put it at the front and only keep first n items
        
        set({contentCache: updated});
    },

    clearContentCache: () => {
        set({contentCache: []});
    }
}));

export default {};