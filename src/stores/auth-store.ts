import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
