import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { addEventListener, getInitialURL } from 'expo-linking';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import { registraErroreAccount } from './registraErroreAccount';
import {
  isRecoveryRedirect,
  isEmailConfirmRedirect,
  getAuthLinkError,
  getLinkType,
  parseAuthRedirect,
} from './authRedirect';
import type { RootStackParamList } from '@/navigation/types';
import { useTranslation } from '@/shared/hooks/useTranslation';

/**
 * Scambia i link PKCE una volta e mostra l'esito nella lingua dell'app.
 * Il recupero resta pendente fino a ready/state del container: ResetPassword è
 * disponibile anche nello stack del cancello profilo. Nessun token dall'URL.
 */
export const useAuthDeepLink = (
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>
): void => {
  const { completeRecoveryFromUrl, completeEmailConfirmFromUrl } = useAuth();
  const { t } = useTranslation();
  const handled = useRef(new Map<string, 'pending' | 'succeeded' | 'failed'>());
  const active = useRef(false);
  const request = useRef(0);
  const pendingReset = useRef(false);
  const currentNavigation = useRef(navigationRef);
  currentNavigation.current = navigationRef;

  useEffect(() => {
    const navigateWhenReady = () => {
      if (!pendingReset.current || !navigationRef.isReady()) return;
      pendingReset.current = false;
      navigationRef.navigate('ResetPassword', undefined, { pop: true });
    };
    const removeReady = navigationRef.addListener('ready', navigateWhenReady);
    const removeState = navigationRef.addListener('state', navigateWhenReady);
    navigateWhenReady();
    return () => {
      removeReady();
      removeState();
    };
  }, [navigationRef]);

  const handleUrl = (url: string | null) => {
    if (!active.current || !url) return;
    const previous = handled.current.get(url);
    if (previous === 'pending' || previous === 'succeeded') return;
    const currentRequest = ++request.current;
    pendingReset.current = false;

    const linkError = getAuthLinkError(url);
    if (linkError) {
      if (!previous) {
        registraErroreAccount(
          { name: 'AuthApiError', code: parseAuthRedirect(url).error_code },
          'LinkAccesso'
        );
      }
      handled.current.set(url, 'failed');
      Alert.alert(
        t('auth.linkExpired.title'),
        t(`auth.linkExpired.${linkError}`)
      );
      return;
    }
    const recovery = isRecoveryRedirect(url);
    if (!recovery && !isEmailConfirmRedirect(url)) return;
    if (previous === 'failed') {
      Alert.alert(t('auth.linkFailed.title'), t('auth.linkFailed.reset'));
      return;
    }
    handled.current.set(url, 'pending');
    const kind = getLinkType(url);
    const isCurrent = () =>
      active.current && request.current === currentRequest;
    const showResult = (ok: boolean) => {
      handled.current.set(url, recovery && !ok ? 'failed' : 'succeeded');
      if (!isCurrent()) return;
      if (recovery) {
        if (!ok) {
          Alert.alert(t('auth.linkFailed.title'), t('auth.linkFailed.reset'));
          return;
        }
        pendingReset.current = true;
        const navigation = currentNavigation.current;
        if (navigation.isReady()) {
          pendingReset.current = false;
          navigation.navigate('ResetPassword', undefined, { pop: true });
        }
        return;
      }
      const prefix = kind === 'emailChange' ? 'emailUpdated' : 'emailConfirmed';
      // Il server verifica l'email prima del redirect, anche se il dispositivo
      // ha perso il verificatore o un secondo invio l'ha sostituito.
      Alert.alert(
        t(`auth.${prefix}.title`),
        t(`auth.${prefix}.${ok ? 'message' : 'signIn'}`)
      );
    };
    const complete = recovery
      ? completeRecoveryFromUrl
      : completeEmailConfirmFromUrl;
    void complete(url).then(
      ({ ok }) => showResult(ok),
      () => showResult(false)
    );
  };
  // La sottoscrizione vive quanto l'hook; gli eventi usano auth e lingua attuali.
  const currentHandler = useRef(handleUrl);
  currentHandler.current = handleUrl;
  useEffect(() => {
    active.current = true;
    let receivedEvent = false;
    let subscribed = true;
    const subscription = addEventListener('url', event => {
      receivedEvent = true;
      currentHandler.current(event.url);
    });
    void getInitialURL().then(
      initialUrl => {
        // Un initial URL tardivo non deve scavalcare un evento più recente.
        if (subscribed && !receivedEvent) currentHandler.current(initialUrl);
      },
      () => {
        // Gli eventi restano disponibili anche se il sistema non dà l'URL iniziale.
        if (subscribed) {
          registraErroreAccount(
            { name: 'InitialUrlUnavailable' },
            'LinkAccesso'
          );
        }
      }
    );
    return () => {
      subscribed = false;
      active.current = false;
      subscription.remove();
    };
  }, []);
};
