import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Merchant } from '@/types';

interface MerchantState {
  merchant: Merchant | null;
  /** Session token proving ownership; sent as x-merchant-token on product writes. */
  token: string | null;
  setMerchant: (m: Merchant) => void;
  logout: () => void;
}

/** Client-side session for a registered shop owner. */
export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      merchant: null,
      token: null,
      setMerchant: (m) => {
        const { token, ...merchant } = m;
        set({ merchant: merchant as Merchant, token: token ?? null });
      },
      logout: () => set({ merchant: null, token: null }),
    }),
    { name: 'geprek-merchant' },
  ),
);
