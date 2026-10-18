import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Location } from '@/shared/types/location';

export interface RootStackParamList {
  Home: NavigatorScreenParams<BottomTabParamList> | undefined;
  Seguici: undefined;
  ChiSiamo: undefined;
  ReConsent: undefined;
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
  MapModal: { locations: Location[] };
};

export type ImpactStackNavigationProp = StackNavigationProp<
  ImpactStackParamList,
  keyof ImpactStackParamList
>;
