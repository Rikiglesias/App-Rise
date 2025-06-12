import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { HeroStory, ImpactState, ImpactStats } from './types';

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

const INITIAL_HERO_STORIES: HeroStory[] = [
  {
    id: '1',
    title: 'Scuola in Kenya ora ha 500 pasti al giorno',
    location: 'Nairobi, Kenya',
    impact: "12.000 bambini nutriti quest'anno",
    image: require('../../assets/images/hero-banner.png') as number,
    accessibilityLabel:
      'Bambini di una scuola in Kenya che ricevono pasti nutrienti grazie al programma Rise Against Hunger',
    color: '#FF6B35',
  },
  {
    id: '2',
    title: 'Comunità in Bangladesh supera la crisi alimentare',
    location: 'Dhaka, Bangladesh',
    impact: '8.500 famiglie supportate',
    image: require('../../assets/images/hero-banner.png') as number,
    accessibilityLabel:
      'Famiglie del Bangladesh che beneficiano dei programmi alimentari di Rise Against Hunger',
    color: '#2ECC71',
  },
  {
    id: '3',
    title: 'Volontari italiani confezionano 50K pasti',
    location: 'Bologna, Italia',
    impact: 'Record mensile raggiunto',
    image: require('../../assets/images/hero-banner.png') as number,
    accessibilityLabel:
      'Volontari italiani di Rise Against Hunger che confezionano pasti per le comunità bisognose',
    color: '#3498DB',
  },
];

export const useImpactStore = create<ImpactState>()(
  devtools(
    set => ({
      // State
      stats: INITIAL_STATS,
      heroStories: INITIAL_HERO_STORIES,
      isLoading: false,
      error: null,

      // Actions
      setStats: (stats: ImpactStats) =>
        set({ stats }, false, 'impact/setStats'),

      setHeroStories: (stories: HeroStory[]) =>
        set({ heroStories: stories }, false, 'impact/setHeroStories'),

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

      setError: (error: string | null) =>
        set({ error }, false, 'impact/setError'),

      clearError: () => set({ error: null }, false, 'impact/clearError'),
    }),
    {
      name: 'impact-store',
    }
  )
);
