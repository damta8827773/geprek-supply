import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dictionaries, type Dictionary, type Lang } from '@/i18n';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: () => Dictionary;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      lang: 'id',
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      toggleLang: () => set({ lang: get().lang === 'id' ? 'en' : 'id' }),
      t: () => dictionaries[get().lang],
    }),
    { name: 'geprek-ui' },
  ),
);

/** Convenience hook returning the active dictionary, re-rendering on lang change. */
export const useDictionary = (): Dictionary =>
  useUiStore((s) => dictionaries[s.lang]);
