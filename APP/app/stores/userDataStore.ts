import { create } from 'zustand';
import { UserData } from '../types/StreamTrackAPI/types';
import { getUserData } from '../helpers/StreamTrackAPIHelper';
// import { APIHelper } from '../helpers/APIHelper';

interface UserDataStore {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: (token: string) => Promise<void>;
  clearUserData: () => void;
}

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async (token) => {
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