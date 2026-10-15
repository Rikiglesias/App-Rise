import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { LocalizedText } from '../utils/localizedText';
import type { ImpactStackParamList } from '@/navigation/types';

export type ImpactNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  'Impact'
>;

export interface ImpactStory {
  id: string;
  title: LocalizedText;
  location: LocalizedText;
  text: LocalizedText;
  image: string;
  category: 'meals' | 'kits' | 'social';
  year: number;
}

export interface ImpactMilestone {
  id: string;
  title: LocalizedText;
  value: LocalizedText;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: LocalizedText;
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
