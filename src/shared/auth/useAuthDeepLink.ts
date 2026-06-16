import { useEffect, useRef } from 'react';
import { useURL } from 'expo-linking';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import { isRecoveryRedirect, isEmailConfirmRedirect } from './authRedirect';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Intercetta i deep link auth con token nel fragment (flusso implicit,
 * `detectSessionInUrl: false`) e stabilisce la sessione:
 * - recovery password → setSession + naviga a "Imposta nuova password";
 * - conferma email signup → setSession (l'utente diventa autenticato e resta su Home,
 *   route iniziale: nessuna navigazione forzata).
 *
 * Usa il `navigationRef` del container (non `useNavigation`) perché va montato a
 * livello di AppNavigator, fuori dal singolo navigator. Guard `handled` per non
 * ri-processare lo stesso URL (evita navigazioni/sessioni doppie su re-render).
 */
export const useAuthDeepLink = (
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>
): void => {
  const url = useURL();
  const { completeRecoveryFromUrl, completeEmailConfirmFromUrl } = useAuth();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url) return;

    if (isRecoveryRedirect(url)) {
      handled.current = url;
      void completeRecoveryFromUrl(url).then(({ ok }) => {
        if (ok && navigationRef.isReady()) {
          navigationRef.navigate('ResetPassword');
        }
      });
    } else if (isEmailConfirmRedirect(url)) {
      handled.current = url;
      void completeEmailConfirmFromUrl(url);
    }
  }, [
    url,
    completeRecoveryFromUrl,
    completeEmailConfirmFromUrl,
    navigationRef,
  ]);
};
