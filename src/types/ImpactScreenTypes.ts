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
}

export interface ImpactMilestone {
  id: string;
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export interface ImpactDataType {
  mealsDistributed: number;
  volunteers: number;
  livesImpacted: number;
  stories: readonly ImpactStory[];
  milestones: readonly ImpactMilestone[];
}
