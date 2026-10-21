import React, { useCallback, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';

import type { RootStackNavigationProp } from './types';
import { PerfectIcon, PlatformTouchable } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useAuth } from '@/shared/auth/AuthContext';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';
import { minimumTouchTarget } from '@/shared/utils/minimumTouchTarget';

/**
 * Intestazione comune alle radici delle schede: porta in alto a destra l'ingresso
 * all'account, che apre la rotta `Account` dello stack principale, sopra le schede.
 * La monta SOLO il navigatore delle schede (opzione `header`): così resta identica su
 * Impatto, Home e Azioni anche quando una di quelle schermate viene rifatta.
 * È opaca e applica lei l'inset superiore: le radici non lo applicano più.
 */
export const TabHeader: React.FC<BottomTabHeaderProps> = ({ options }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { status } = useAuth();
  const { t } = useTranslation();
  const { colors } = useUniversalTheme();

  // Durante il caricamento della sessione il pulsante resta quello dell'ospite:
  // la pagina che apre mostra da sé l'attesa.
  const signedIn = status === 'authenticated';
  const openAccount = useCallback(
    () => navigation.navigate('Account'),
    [navigation]
  );

  // Lo sfondo arriva da `headerStyle` di ogni scheda: quello della radice su cui sta.
  const containerStyle = useMemo(
    () => [
      styles.container,
      options.headerStyle,
      {
        paddingTop: insets.top,
        paddingLeft: Math.max(insets.left, PerfectSpacing.lg),
        paddingRight: Math.max(insets.right, PerfectSpacing.lg),
      },
    ],
    [options.headerStyle, insets.top, insets.left, insets.right]
  );

  return (
    <Animated.View style={containerStyle} testID="tab-header">
      <PlatformTouchable
        onPress={openAccount}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={t(
          signedIn ? 'auth.profile.title' : 'auth.login.title'
        )}
        testID="account-header-button"
      >
        <PerfectIcon
          name={signedIn ? 'account-circle' : 'account-circle-outline'}
          size={30}
          color={colors.text}
        />
      </PlatformTouchable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: PerfectSpacing.xs,
  },
  button: {
    ...minimumTouchTarget(),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
