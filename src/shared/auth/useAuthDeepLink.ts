import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useURL } from 'expo-linking';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import {
  isRecoveryRedirect,
  isEmailConfirmRedirect,
  getAuthLinkError,
} from './authRedirect';
import type { RootStackParamList } from '@/navigation/types';
import { useTranslation } from '@/shared/hooks/useTranslation';

/**
 * Intercetta i deep link auth con token nel fragment (flusso implicit,
 * `detectSessionInUrl: false`) e stabilisce la sessione:
 * - recovery password → setSession + naviga a "Imposta nuova password". Quella rotta
 *   esiste in ENTRAMBI gli alberi di navigazione, anche in quello del cancello del
 *   profilo: è l'unico modo in cui chi è bloccato lì può rientrare nel proprio account.
 * - conferma email signup → setSession, nessuna navigazione forzata. Dove si trova poi
 *   la persona non lo decide questo hook: diventa autenticata, e se il profilo è
 *   incompleto il cancello la porta al completamento invece che su Home — è il
 *   comportamento voluto («appena fa accesso»), non un effetto collaterale.
 * - link scaduto o già usato (`error_code` nel fragment) → avviso tradotto che dice
 *   come chiederne uno nuovo: senza, l'app si apriva e non succedeva nulla.
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
  const { t } = useTranslation();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url) return;

    const linkError = getAuthLinkError(url);
    if (linkError) {
      handled.current = url;
      Alert.alert(
        t('auth.linkExpired.title'),
        t(`auth.linkExpired.${linkError}`)
      );
    } else if (isRecoveryRedirect(url)) {
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
    t,
  ]);
};
