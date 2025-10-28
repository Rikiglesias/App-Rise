import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../../navigation/types';

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

export interface CategorySection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: [string, string];
  actions: InfoAction[];
}

export interface ProfessionalTypography {
  display: {
    fontSize: number;
    fontWeight: '600';
    letterSpacing: number;
    lineHeight: number;
  };
  headline: {
    fontSize: number;
    fontWeight: '600';
    letterSpacing: number;
    lineHeight: number;
  };
  title: {
    fontSize: number;
    fontWeight: '600';
    letterSpacing: number;
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: '500';
    letterSpacing: number;
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: '400';
    letterSpacing: number;
    lineHeight: number;
  };
}

export interface ProfessionalColors {
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    inverse: string;
  };
  border: {
    light: string;
    default: string;
    accent: string;
  };
}
