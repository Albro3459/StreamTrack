import { create } from 'zustand';
// import { APIHelper } from '../helpers/APIHelper';

type UserData = {
    email: string | null;
    name: string | null;
    birthday: string | null;
    location: string | null;
    bio: string | null;
    genres: Set<string> | null;
}

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

    // const result = await APIHelper(token); // fetch from API later
    const result = {
        success: true,
        error: "None",
        data: {
            email: "brodsky.alex22@gmail.com",
            name: "Alex Brodsky",
            birthday: "09/22/2002",
            location: "Los Gatos, CA",
            bio: "Idk gang",
            genres: new Set(["Thriller", "Action", "Comedy"])
        }
    }

    if (result.success) {
      set({ userData: result.data, loading: false });
    } else {
      set({ error: result.error || 'Fetch failed', loading: false });
    }
  },

  clearUserData: () => {
    set({ userData: null, error: null, loading: false });
  },
}));

export default {};