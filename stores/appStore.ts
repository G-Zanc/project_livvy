import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AppState {
  // Menu state
  menuVisible: boolean;
  showMenu: () => void;
  hideMenu: () => void;

  // Chat state
  chatVisible: boolean;
  messages: Message[];
  isProcessing: boolean;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (message: Message) => void;
  setProcessing: (processing: boolean) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Menu state
  menuVisible: false,
  showMenu: () => set({ menuVisible: true }),
  hideMenu: () => set({ menuVisible: false }),

  // Chat state
  chatVisible: false,
  messages: [],
  isProcessing: false,
  openChat: () => set({ chatVisible: true }),
  closeChat: () => set({ chatVisible: false }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setProcessing: (processing) => set({ isProcessing: processing }),
  clearMessages: () => set({ messages: [] }),
}));
