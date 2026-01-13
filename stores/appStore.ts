import { create } from "zustand";

interface AppState {
  menuVisible: boolean;
  showMenu: () => void;
  hideMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  menuVisible: false,
  showMenu: () => set({ menuVisible: true }),
  hideMenu: () => set({ menuVisible: false }),
}));
