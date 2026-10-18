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

  // Associazioni partner, come le elenca il report
  partnerAssociations: readonly string[];
}
