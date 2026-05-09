import { create } from 'zustand'

interface AppState {
  user: { name: string; email: string } | null;
  isLoading: boolean;
  setUser: (user: { name: string; email: string } | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
