import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Merchant } from '@/types';

interface MerchantState {
  merchant: Merchant | null;
  setMerchant: (m: Merchant) => void;
  logout: () => void;
}

/** Client-side session for a registered shop owner. */
export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      merchant: null,
      setMerchant: (m) => set({ merchant: m }),
      logout: () => set({ merchant: null }),
    }),
    { name: 'geprek-merchant' },
  ),
);
