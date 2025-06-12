import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AppState } from './types';

export const useAppStore = create<AppState>()(
  devtools(
    set => ({
      // State
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setLoading: (loading: boolean) =>
        set({ isLoading: loading }, false, 'app/setLoading'),

      setError: (error: string | null) => set({ error }, false, 'app/setError'),

      setLastUpdated: (timestamp: string) =>
        set({ lastUpdated: timestamp }, false, 'app/setLastUpdated'),

      clearError: () => set({ error: null }, false, 'app/clearError'),
    }),
    {
      name: 'app-store',
    }
  )
);
