import { useEffect, useRef } from 'react';
import { useURL } from 'expo-linking';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import { isRecoveryRedirect } from './authRedirect';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Intercetta il deep link di recovery password: quando l'app si apre dal link
 * dell'email, stabilisce la sessione dai token nel fragment e porta l'utente alla
 * schermata "Imposta nuova password".
 *
 * Usa il `navigationRef` del container (non `useNavigation`) perché va montato a
 * livello di AppNavigator, fuori dal singolo navigator. Guard `handled` per non
 * ri-processare lo stesso URL (evita navigazioni doppie su re-render).
 */
export const useRecoveryDeepLink = (
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>
): void => {
  const url = useURL();
  const { completeRecoveryFromUrl } = useAuth();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url || !isRecoveryRedirect(url)) return;
    handled.current = url;
    void completeRecoveryFromUrl(url).then(({ ok }) => {
      if (ok && navigationRef.isReady()) {
        navigationRef.navigate('ResetPassword');
      }
    });
  }, [url, completeRecoveryFromUrl, navigationRef]);
};
