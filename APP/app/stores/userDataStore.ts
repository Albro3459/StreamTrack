"use client";

import { create } from 'zustand';
import { ContentPartialData, UserData, UserMinimalData } from '../types/dataTypes';
import { getUserContents, getUserMinimalData } from '../helpers/StreamTrack/userHelper';
import { Alert } from '../components/alertMessageComponent';

// Wrappers
export const fetchUserData = (token: string,
                                setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                                setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
) => {
    const store = useUserDataStore.getState();
    if (store.loading) return;
    store.fetchUserData(token, setAlertMessageFunc, setAlertTypeFunc);
};

export const clearUserData = () => useUserDataStore.getState().clearUserData();

export const setUserData = (data: UserData, force: boolean = false) => {
    const store = useUserDataStore.getState();
    if (!force && store.loading) return;
    store.clearUserData();
    store.setUserData(data);
}

// Store
interface UserDataStore {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: (token: string, 
                    setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                    setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
                ) => Promise<void>;
  clearUserData: () => void;
  setUserData: (data: UserData) => void;
}

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async (token: string,
                        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
                        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
  ) => {
        set({ loading: true, error: null });

        const userMinimalData: UserMinimalData = await getUserMinimalData(token);
        const contentMinimalData: ContentPartialData[] = await getUserContents(token);

        if (userMinimalData && contentMinimalData) {
            set({ userData: {user: userMinimalData, contents: contentMinimalData} as UserData, loading: false });
        } else {
            set({ error: 'Fetch failed', loading: false });
            if (setAlertMessageFunc) setAlertMessageFunc('Fetch failed'); 
            if (setAlertTypeFunc) setAlertTypeFunc(Alert.Error);
        }
  },

  clearUserData: () => {
        set({ userData: null, error: null, loading: false });
  },

  setUserData: (data: UserData) => set({ userData: data, loading: false })
}));

export default {};