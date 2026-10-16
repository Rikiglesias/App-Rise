import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

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

const AppNavigator: React.FC<{ onReady?: (() => void) | undefined }> = ({
  onReady,
}) => {
  // Deep link auth (recovery password + conferma email signup): stabilisce la sessione.
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  useAuthDeepLink(navigationRef);

  const { status, profile, profileLoaded, needsReConsent } = useAuth();
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
    (needsReConsent ||
      isProfileGateBlocked(getProfileCompletion(profile, profileLoaded)));

  const wasGateBlocked = useRef(gateBlocked);
  useEffect(() => {
    const leavingGate = wasGateBlocked.current && !gateBlocked;
    wasGateBlocked.current = gateBlocked;
    // I due stack condividono ResetPassword/DeleteAccount: uscendo dal cancello
    // non se ne deve reidratare la cronologia. In ingresso invece si preserva il
    // recupero già aperto da un link, che viene gestito una volta sola.
    if (leavingGate && navigationRef.isReady()) {
      navigationRef.resetRoot({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [gateBlocked, navigationRef]);

  useEffect(() => {
    if (!gateBlocked) return;
    // L'effetto del padre segue quello di NavigationContainer: su Android questo
    // listener viene chiamato per primo anche se l'app parte già nel cancello.
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => subscription.remove();
  }, [gateBlocked]);

  return (
    <NavigationContainer ref={navigationRef} {...(onReady ? { onReady } : {})}>
      {gateBlocked ? (
        <ProfileGateNavigator needsReConsent={needsReConsent} />
      ) : (
        <MainStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
