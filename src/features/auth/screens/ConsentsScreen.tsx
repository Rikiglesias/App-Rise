import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { FormError } from '../components/FormError';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';

/**
 * Sotto-pagina Consensi (dal menu Profilo). Raggiungibile solo con un profilo
 * esistente: qui il toggle marketing agisce sempre su una riga profilo reale, così
 * l'update di `profiles.marketing_consent` non tocca 0 righe (bug pre-redesign).
 */
export const ConsentsScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { profile, setMarketingConsent } = useAuth();

  // Guardia anti doppio-invio: il ref regge due tap nello stesso frame (sincrono),
  // lo state pilota solo il feedback visivo (disabled).
  const marketingRef = useRef(false);
  const [marketingBusy, setMarketingBusy] = useState(false);
  const [consentError, setConsentError] = useState<string | undefined>();

  const handleMarketingToggle = useCallback(
    (value: boolean): void => {
      if (marketingRef.current) return;
      marketingRef.current = true;
      setConsentError(undefined);
      setMarketingBusy(true);
      void setMarketingConsent(value)
        .then(r => {
          if (r.error) setConsentError(t('auth.consents.error'));
        })
        .finally(() => {
          marketingRef.current = false;
          setMarketingBusy(false);
        });
    },
    [setMarketingConsent, t]
  );

  return (
    <AuthScreen
      title={t('auth.consents.title')}
      subtitle={t('auth.consents.subtitle')}
    >
      <View style={styles.toggleRow}>
        <PerfectText size={16} lines={2} style={styles.toggleLabel}>
          {t('auth.consents.marketing')}
        </PerfectText>
        <Switch
          value={profile?.marketing_consent ?? false}
          onValueChange={handleMarketingToggle}
          disabled={marketingBusy}
          trackColor={{ true: Colors.primary[500], false: colors.neutral[300] }}
          ios_backgroundColor={colors.neutral[300]}
          accessibilityLabel={t('auth.consents.marketing')}
        />
      </View>
      <PerfectText size={13} lines={3} containerWidth={0} style={styles.hint}>
        {t('auth.consents.marketingHint')}
      </PerfectText>
      <FormError message={consentError} size={13} style={styles.error} />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.neutral[0],
      borderRadius: scale(14),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.md,
    },
    toggleLabel: {
      color: colors.neutral[900],
      fontWeight: '600',
      flex: 1,
      marginRight: PerfectSpacing.base,
    },
    hint: {
      color: colors.neutral[500],
      marginTop: PerfectSpacing.sm,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
