import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

/**
 * Persisted theme store.
 * Saves preference via safeStorage with in-memory fallback.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system' as ThemeMode,

      setMode: (mode: ThemeMode) => set({ mode }),

      cycleMode: () => {
        const current = get().mode;
        const next: ThemeMode =
          current === 'system'
            ? 'light'
            : current === 'light'
              ? 'dark'
              : 'system';
        set({ mode: next });
      },
    }),
    {
      name: 'omnicalc-theme',
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
