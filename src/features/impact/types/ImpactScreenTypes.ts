import type { StackNavigationProp } from '@react-navigation/stack';
import type { ImpactStackParamList } from '@/navigation/types';

export type ImpactNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  'Impact'
>;

export interface ImpactDataType {
  /** URL dell'Annual Report da cui vengono tutti i numeri */
  fonte: string;
  /** Anno dei risultati annuali: unica sorgente dell'anno mostrato nelle etichette */
  resultsYear: number;

  // Dalla nascita di RAH Italia
  mealsProducedLifetime: number;
  kitsProducedLifetime: number;

  // Anno dei risultati
  mealsProduced: number;
  livesImpactedMeals: number;
  volunteers: number;

  // Pasti distribuiti, per paese
  mealsDistributed: number;
  mealsByCountry: { zimbabwe: number; southAfrica: number; ukraine: number };

  // Kit e pasti che garantiscono
  kitsProduced: number;
  kitsDistributed: number;
  kitsByArea: { italy: number; ukraine: number; europe: number };
  mealsGuaranteedByKits: number;
  livesImpactedKits: number;
  mealsPerKit: number;

  // Altri totali dalla nascita
  mealsGuaranteedByKitsLifetime: number;
  livesImpactedLifetime: number;

  // Associazioni partner, come le elenca il report
  partnerAssociations: readonly string[];
}
