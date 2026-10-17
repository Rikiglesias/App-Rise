import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useURL } from 'expo-linking';
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
  const url = useURL();
  const { completeRecoveryFromUrl, completeEmailConfirmFromUrl } = useAuth();
  const { t } = useTranslation();
  const handled = useRef<string | null>(null);
  const active = useRef(false);
  const request = useRef(0);
  const pendingReset = useRef(false);
  const currentNavigation = useRef(navigationRef);
  currentNavigation.current = navigationRef;

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    const navigateWhenReady = () => {
      if (!pendingReset.current || !navigationRef.isReady()) return;
      pendingReset.current = false;
      navigationRef.navigate('ResetPassword');
    };
    const removeReady = navigationRef.addListener('ready', navigateWhenReady);
    const removeState = navigationRef.addListener('state', navigateWhenReady);
    navigateWhenReady();
    return () => {
      removeReady();
      removeState();
    };
  }, [navigationRef]);

  useEffect(() => {
    if (handled.current === url) return;
    handled.current = url;
    const currentRequest = ++request.current;
    pendingReset.current = false;
    if (!url) return;

    const linkError = getAuthLinkError(url);
    if (linkError) {
      registraErroreAccount(
        { name: 'AuthApiError', code: parseAuthRedirect(url).error_code },
        'LinkAccesso'
      );
      Alert.alert(
        t('auth.linkExpired.title'),
        t(`auth.linkExpired.${linkError}`)
      );
      return;
    }
    const recovery = isRecoveryRedirect(url);
    if (!recovery && !isEmailConfirmRedirect(url)) return;
    const kind = getLinkType(url);
    const isCurrent = () =>
      active.current && request.current === currentRequest;
    const showResult = (ok: boolean) => {
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
          navigation.navigate('ResetPassword');
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
  }, [url, completeRecoveryFromUrl, completeEmailConfirmFromUrl, t]);
};
