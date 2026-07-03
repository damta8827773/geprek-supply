import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
}

/**
 * Lightweight client session. The email is only a UI convenience - every
 * mutating request is re-verified server-side against ADMIN_EMAIL.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      email: null,
      login: (email) => set({ email: email.trim().toLowerCase() }),
      logout: () => set({ email: null }),
    }),
    { name: 'geprek-admin' },
  ),
);
