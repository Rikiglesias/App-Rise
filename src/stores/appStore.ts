import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AppState } from './types';

const creator = (
  set: (
    partial: Partial<AppState> | ((state: AppState) => Partial<AppState>),
    replace?: boolean,
    name?: string
  ) => void
) => ({
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
});

export const useAppStore = create<AppState>()(
  __DEV__
    ? devtools(creator as never, { name: 'app-store' })
    : (creator as never)
);
