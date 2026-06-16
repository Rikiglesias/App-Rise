import type { StackNavigationProp } from '@react-navigation/stack';

import type { RootStackParamList } from '@/navigation/types';

export interface ContributeTabScreenProps {
  navigation: StackNavigationProp<RootStackParamList>;
}

export interface InfoAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: 'azione' | 'scopri' | 'connetti';
  priority: 'alta' | 'media';
  onPress: () => void;
}
