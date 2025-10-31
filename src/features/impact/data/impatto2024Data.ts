/**
 * Dati statici per la schermata Impatto 2024
 * Separati dal componente per manutenibilità
 */

export interface StatCardData {
  readonly icon: string;
  readonly number: string;
  readonly label: string;
  readonly description: string;
}

export interface ImpactItemData {
  readonly icon: string;
  readonly text: string;
}

export const STATS_2024: readonly StatCardData[] = [
  {
    icon: '🍽️',
    number: '3.14M',
    label: 'Pasti Confezionati',
    description: 'Nutrizione per comunità in difficoltà',
  },
  {
    icon: '📦',
    number: '16.3K',
    label: 'Kit Prodotti',
    description: 'Kit completi per emergenze',
  },
  {
    icon: '👥',
    number: '13K',
    label: 'Volontari',
    description: 'Persone che hanno fatto la differenza',
  },
] as const;

export const IMPACT_AREAS: readonly ImpactItemData[] = [
  { icon: '🌍', text: 'Africa Subsahariana' },
  { icon: '🏫', text: 'Programmi scolastici' },
  { icon: '🚨', text: 'Emergenze umanitarie' },
  { icon: '🇮🇹', text: 'Comunità italiane' },
] as const;

export const GOAL_2025 = {
  icon: '🎯',
  title: 'Obiettivo 2025',
  description: 'Superare i 4 milioni di pasti confezionati',
} as const;
