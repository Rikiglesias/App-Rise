import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ImpactStackParamList } from '../navigation/types';

export type ImpactNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  'Impact'
>;

export type ImpactScreenName =
  | 'Impact'
  | 'Beneficiaries'
  | 'Volunteers'
  | 'Partners';

export interface StatButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  color: string;
}

export interface ImpactStory {
  id: string;
  title: string;
  location: string;
  text: string;
  image: string;
  category: 'meals' | 'kits' | 'social';
  year: number;
}

export interface ImpactMilestone {
  id: string;
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
}

export interface ImpactDataType {
  // Dati principali 2024
  mealsDistributed: number;
  mealsProduced: number;
  mealsDistributedTotal: number;

  // Kit packages
  kitPackages: number;
  kitDistributed: number;
  kitProducedTotal: number;

  // Volontari
  volunteers: number;
  volunteersTotal: number;

  // Persone aiutate
  livesImpactedMeals: number;
  livesImpactedKits: number;
  livesImpacted: number;

  // Dati storici
  mealsProducedLifetime: number;

  // Contenuti
  stories: readonly ImpactStory[];
  milestones: readonly ImpactMilestone[];
}
