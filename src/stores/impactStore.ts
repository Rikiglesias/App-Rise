import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ImpactState, ImpactStats } from './types';

// Mock data iniziali
const INITIAL_STATS: ImpactStats = {
  meals: {
    current: 3100000,
    target: 4000000,
    label: 'Pasti',
    sublabel: 'Obiettivo 4M entro 2025',
  },
  volunteers: {
    current: 13000,
    target: 20000,
    label: 'Volontari',
    sublabel: 'Target 20K volontari',
  },
  kits: {
    current: 16000,
    target: 25000,
    label: 'Kit Distribuiti',
    sublabel: 'Target 25K kit',
  },
};

const creator = (
  set: (
    partial:
      | Partial<ImpactState>
      | ((state: ImpactState) => Partial<ImpactState>),
    replace?: boolean,
    name?: string
  ) => void
) => ({
  // State
  stats: INITIAL_STATS,
  isLoading: false,
  error: null,

  // Actions
  setStats: (stats: ImpactStats) => set({ stats }, false, 'impact/setStats'),

  updateStat: (
    category: keyof ImpactStats,
    updates: Partial<ImpactStats[keyof ImpactStats]>
  ) =>
    set(
      state => ({
        stats: {
          ...state.stats,
          [category]: {
            ...state.stats[category],
            ...updates,
          },
        },
      }),
      false,
      'impact/updateStat'
    ),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }, false, 'impact/setLoading'),

  setError: (error: string | null) => set({ error }, false, 'impact/setError'),

  clearError: () => set({ error: null }, false, 'impact/clearError'),
});

export const useImpactStore = create<ImpactState>()(
  __DEV__
    ? devtools(creator as never, { name: 'impact-store' })
    : (creator as never)
);
