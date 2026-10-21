import React, { createContext, useCallback, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { PerfectIcon, PerfectText, PlatformTouchable } from '@/components/ui';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { RootStackNavigationProp } from '@/navigation/types';

// Il cancello del profilo non espone il ritorno dei moduli nello stack.
export const AuthBackDisabledContext = createContext(false);

export const AuthBackButton: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const disabled = useContext(AuthBackDisabledContext);
  const { t } = useTranslation();
  const { colors } = useUniversalTheme();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  if (disabled || !navigation.canGoBack()) return null;

  return (
    <PlatformTouchable
      onPress={goBack}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <PerfectIcon name="arrow-left" size={24} color={colors.text} />
      <PerfectText size={16} lines={1} immunity color={colors.text}>
        {t('common.back')}
      </PerfectText>
    </PlatformTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 48,
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: PerfectSpacing.xs,
    marginHorizontal: PerfectSpacing.lg,
  },
});
