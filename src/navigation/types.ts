import type { StackNavigationProp } from '@react-navigation/stack';

import type { Location } from '@/shared/types/location';

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
  SignUp: undefined;
  CompleteProfile: undefined;
  ProfileEdit: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  DeleteAccount: undefined;
  // Index signature RICHIESTA da React Navigation: StackNavigationProp vincola
  // il ParamList a ParamListBase ([routeName: string]: object | undefined).
  // Rimuoverla rompe il typecheck di Navigator/navigation in ~13 punti.
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
  ProfileTab: undefined;
};

// Impact Stack Navigator Types
export type ImpactStackParamList = {
  Impact: undefined;
  Beneficiaries: undefined;
  Volunteers: undefined;
  Partners: undefined;
  Meals: undefined;
  Kits: undefined;
  DevelopmentModal: undefined;
  MapModal: { locations: Location[] };
};

export type ImpactStackNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  keyof ImpactStackParamList
>;
