import { create } from 'zustand';
import { StreamingServiceData } from '../types/dataTypes';
import { getStreamingServiceData } from '../helpers/StreamTrack/streamingHelper';

interface StreamingServiceDataStore {
  streamingServiceData: StreamingServiceData[] | null;
  loading: boolean;
  error: string | null;
  fetchStreamingServiceData: (token: string) => Promise<void>;
  clearStreamingServiceData: () => void;
}

export const fetchStreamingServiceData = (token: string) => {
    const store = useStreamingServiceDataStore.getState();
    if (store.loading) return;
    store.fetchStreamingServiceData(token);
};
export const clearStreamingServiceData = () => useStreamingServiceDataStore.getState().clearStreamingServiceData();

export const useStreamingServiceDataStore = create<StreamingServiceDataStore>((set) => ({
  streamingServiceData: null,
  loading: false,
  error: null,

  fetchStreamingServiceData: async (token: string) => {
    set({ loading: true, error: null });

    const result: StreamingServiceData[] | null = await getStreamingServiceData(token);

    if (result) {
        set({ streamingServiceData: result, loading: false });
    } else {
        set({ error: 'Fetch failed', loading: false });
    }
  },

  clearStreamingServiceData: () => {
    set({ streamingServiceData: null, error: null, loading: false });
  },
}));

export default {};