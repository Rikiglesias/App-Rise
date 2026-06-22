import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Guard per le schermate post-login (CompleteProfile/ProfileEdit/DeleteAccount):
 * se la sessione risulta NON autenticata, rimanda alla schermata Profilo (Area
 * Donatori), che mostra la landing di accesso. Non scatta su `loading`.
 * Difesa UX in aggiunta alle RLS server-side e ai check `not_authenticated` delle azioni.
 */
export const useRequireAuth = (): void => {
  const { status } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigation.navigate('Profilo');
    }
  }, [status, navigation]);
};
