import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';

import 'react-native-gesture-handler';

import MainStackNavigator from './MainStackNavigator';
import ProfileGateNavigator from './ProfileGateNavigator';
import type { RootStackParamList } from './types';
import { useAuth } from '@/shared/auth/AuthContext';
import {
  getProfileCompletion,
  isProfileGateBlocked,
} from '@/shared/auth/profileCompletion';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';

const AppNavigator: React.FC = () => {
  // Deep link auth (recovery password + conferma email signup): stabilisce la sessione.
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  useAuthDeepLink(navigationRef);

  const { status, profile, profileLoaded } = useAuth();
  // Il cancello del profilo (A4): chi ha già fatto l'accesso e non ha finito di dare i
  // propri dati vede SOLO il passaggio di completamento, al posto dell'app.
  // `status === 'authenticated'` è la metà che protegge gli OSPITI: da ospite si dona
  // senza account (è l'unica strada in cui il denaro passa senza registrazione), quindi
  // il cancello sta DOPO l'accesso, mai davanti all'app.
  // Il predicato è quello di `profileCompletion`, lo stesso che consulta il
  // salvataggio: se qui ne comparisse una copia, un domani il cancello potrebbe
  // pretendere un campo che il salvataggio non scrive e la persona non uscirebbe più.
  const gateBlocked =
    status === 'authenticated' &&
    isProfileGateBlocked(getProfileCompletion(profile, profileLoaded));

  return (
    <NavigationContainer ref={navigationRef}>
      {gateBlocked ? <ProfileGateNavigator /> : <MainStackNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
