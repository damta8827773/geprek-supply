import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  sessionId: number | null;
  token: string | null;
  setSession: (sessionId: number, token: string) => void;
}

/** Persists the visitor's chat session token so a page refresh keeps the same conversation. */
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessionId: null,
      token: null,
      setSession: (sessionId, token) => set({ sessionId, token }),
    }),
    { name: 'geprek-chat' },
  ),
);
