import { create } from 'zustand';
import { ContentData } from '../types/dataTypes';

interface ContentDataStore {
    recentContent: ContentData[];
    addRecentContent: (content: ContentData) => void;
}

export const getRecentContent = (tmdbID: string): ContentData | null => {
    const store = useContentDataStore.getState();
    const recent: ContentData[] = store.recentContent;
    return recent.find(c => c.tmdbID === tmdbID);
};

export const useContentDataStore = create<ContentDataStore>((set, get) => ({
    recentContent: [],

    addRecentContent: (content: ContentData) => {
        const recent: ContentData[] = get().recentContent;

        const filtered = recent.filter(c => c.tmdbID !== content.tmdbID); // Remove duplicates

        const updated = [content, ...filtered].slice(0, 15); // Put it at the front and only keep first n items
        
        set({recentContent: updated});
    },
}));

export default {};