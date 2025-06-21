import { create } from 'zustand';
import { UserData } from '../types/dataTypes';
import { getUserData } from '../helpers/StreamTrack/userHelper';
// import { APIHelper } from '../helpers/APIHelper';

interface UserDataStore {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: (token: string) => Promise<void>;
  clearUserData: () => void;
}

export const fetchUserData = (token: string) => {
    const store = useUserDataStore.getState();
    if (store.loading) return;
    store.fetchUserData(token);
};
export const clearUserData = () => useUserDataStore.getState().clearUserData();

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async (token: string) => {
    set({ loading: true, error: null });

    const result = await getUserData(token);

    if (result) {
        set({ userData: result, loading: false });
    } else {
        set({ error: 'Fetch failed', loading: false });
    }
  },

  clearUserData: () => {
    set({ userData: null, error: null, loading: false });
  },
}));

export default {};