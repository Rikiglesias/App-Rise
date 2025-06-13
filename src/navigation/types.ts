import type { StackNavigationProp } from '@react-navigation/stack';

import type { Location } from '../components/layout/InteractiveMap';

export interface RootStackParamList {
  Home: undefined;
  Progetti: undefined;
  Impatto2024: undefined;
  CharityShop: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  CharityGiftCard: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  Calendario: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  Seguici: undefined;
  Tracciabilita: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  ChiSiamo: undefined;
  Projects: undefined;
  [key: string]: undefined | object;
}

export type RootStackNavigationProp = StackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

// Bottom Tab Navigator Types
export type BottomTabParamList = {
  ImpactTab: undefined;
  HomeTab: undefined;
  InfoTab: undefined;
};

// Impact Stack Navigator Types
export type ImpactStackParamList = {
  Impact: undefined;
  Beneficiaries: undefined;
  Volunteers: undefined;
  Partners: undefined;
  MapModal: { locations: Location[] };
  [key: string]: undefined | object;
};

export type ImpactStackNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  keyof ImpactStackParamList
>;
