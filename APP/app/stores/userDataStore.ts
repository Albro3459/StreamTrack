import { create } from 'zustand';
import { ContentPartialData, UserData, UserMinimalData } from '../types/dataTypes';
import { getUserContents, getUserMinimalData } from '../helpers/StreamTrack/userHelper';
// import { APIHelper } from '../helpers/APIHelper';

interface UserDataStore {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: (token: string) => Promise<void>;
  clearUserData: () => void;
  setUserData: (data: UserData) => void;
}

export const fetchUserData = (token: string) => {
    const store = useUserDataStore.getState();
    if (store.loading) return;
    store.fetchUserData(token);
};
export const clearUserData = () => useUserDataStore.getState().clearUserData();

export const setUserData = (data: UserData, force: boolean = false) => {
    const store = useUserDataStore.getState();
    if (!force && store.loading) return;
    store.clearUserData();
    store.setUserData(data);
}

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async (token: string) => {
    set({ loading: true, error: null });

    const userMinimalData: UserMinimalData = await getUserMinimalData(token);
    const contentMinimalData: ContentPartialData[] = await getUserContents(token);

    if (userMinimalData && contentMinimalData) {
        set({ userData: {user: userMinimalData, contents: contentMinimalData} as UserData, loading: false });
    } else {
        set({ error: 'Fetch failed', loading: false });
    }
  },

  clearUserData: () => {
    set({ userData: null, error: null, loading: false });
  },

  setUserData: (data: UserData) => set({ userData: data, loading: false })
}));

export default {};