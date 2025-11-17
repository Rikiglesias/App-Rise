/**
 * Dati statici per la schermata Impatto 2024
 * Separati dal componente per manutenibilità
 */

export interface StatCardData {
  readonly icon: string;
  readonly number: string;
  readonly labelKey: string; // Chiave di traduzione
  readonly descriptionKey: string; // Chiave di traduzione
}

export interface ImpactItemData {
  readonly icon: string;
  readonly textKey: string; // Chiave di traduzione
}

export const STATS_2024: readonly StatCardData[] = [
  {
    icon: '🍽️',
    number: '3.14M',
    labelKey: 'impact.mealsPackagedStat',
    descriptionKey: 'impact.mealsPackagedDesc',
  },
  {
    icon: '📦',
    number: '16.3K',
    labelKey: 'impact.productKitsStat',
    descriptionKey: 'impact.productKitsDesc',
  },
  {
    icon: '👥',
    number: '13K',
    labelKey: 'impact.volunteersStat',
    descriptionKey: 'impact.volunteersStatDesc',
  },
] as const;

export const IMPACT_AREAS: readonly ImpactItemData[] = [
  { icon: '🌍', textKey: 'impact.subsaharanAfrica' },
  { icon: '🏫', textKey: 'impact.schoolPrograms' },
  { icon: '🚨', textKey: 'impact.humanitarianEmergencies' },
  { icon: '🇮🇹', textKey: 'impact.italianCommunities' },
] as const;

export const GOAL_2025 = {
  icon: '🎯',
  titleKey: 'impact.goal2025',
  descriptionKey: 'impact.goal2025Description',
} as const;
