"use client";

import { create } from 'zustand';
import { ContentInfoData, ContentPartialData } from '../types/dataTypes';

export const getCachedContent = (tmdbID: string): ContentInfoData | null => {
    const store = useCacheStore.getState();
    const recent: ContentInfoData[] = store.contentCache;
    return recent.find(c => c.content.tmdbID === tmdbID);
};

export const getCachedSearch = (keyword: string): ContentPartialData[] | null => {
    const store = useCacheStore.getState();
    const recent: Record<string, ContentPartialData[]> = store.searchCache;
    const found: [string, ContentPartialData[]] = Object.entries(recent).find(([key]) => key === keyword);
    return found ? found[1] : null;
};

export const clearCache = () : void => {
    const store = useCacheStore.getState();
    store.clearCache();
};

interface CacheStore {
    contentCache: ContentInfoData[];
    cacheContent: (info: ContentInfoData) => void;

    searchCache: Record<string, ContentPartialData[]>;
    cacheSearch: (keyword: string, contents: ContentPartialData[]) => void;

    clearCache: () => void;
}

export const useCacheStore = create<CacheStore>((set, get) => ({
    contentCache: [],

    cacheContent: (info: ContentInfoData) => {
        const recent: ContentInfoData[] = get().contentCache;

        const filtered = recent.filter(c => c.content.tmdbID !== info.content.tmdbID); // Remove duplicates

        const updated = [info, ...filtered].slice(0, 15); // Put it at the front and only keep first n items
        
        set({contentCache: updated});
    },

    searchCache: {},

    cacheSearch: (keyword: string, contents: ContentPartialData[]) => {
        const recent: Record<string, ContentPartialData[]> = get().searchCache;

        // Remove old matching search if it exists
        const filtered = Object.entries(recent).filter(([k]) => k !== keyword);

        // Add to the front
        const updated = [[keyword, contents], ...filtered].slice(0, 25); // Limit to 25

        const updatedCache = Object.fromEntries(updated);

        set({ searchCache: updatedCache });
    },

    clearCache: () => {
        set({contentCache: [], searchCache: {}});
    }
}));

export default {};