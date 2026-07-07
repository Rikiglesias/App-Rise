import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCountryByCca2, type ICountryCca2 } from 'rn-country-select';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { LoginScreen } from './LoginScreen';
import { ReConsentScreen } from './ReConsentScreen';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import type { RootStackNavigationProp } from '@/navigation/types';
import {
  formatDateLocalized,
  getDeletionScheduledDate,
} from '@/shared/utils/dateFormat';

const GRACE_DAYS = 30;

export const ProfileScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const {
    status,
    session,
    profile,
    signOut,
    exportData,
    cancelScheduledDeletion,
    setMarketingConsent,
    needsReConsent,
  } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [exportError, setExportError] = useState<string | undefined>();
  const [consentError, setConsentError] = useState<string | undefined>();
  const [deletionError, setDeletionError] = useState<string | undefined>();
  // Guardie anti doppio-invio delle azioni asincrone (toggle consenso, annulla
  // cancellazione, export). Il ref è la guardia SINCRONA (regge due tap nello stesso
  // frame, prima del re-render); lo state pilota solo il feedback visivo (disabled).
  const marketingRef = useRef(false);
  const deletionRef = useRef(false);
  const exportRef = useRef(false);
  const [marketingBusy, setMarketingBusy] = useState(false);
  const [deletionBusy, setDeletionBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleLogout = useCallback((): void => {
    void signOut();
  }, [signOut]);
  const handleCompleteProfile = useCallback(
    (): void => navigation.navigate('CompleteProfile'),
    [navigation]
  );
  const handleEditProfile = useCallback(
    (): void => navigation.navigate('ProfileEdit'),
    [navigation]
  );
  const handleExport = useCallback((): void => {
    if (exportRef.current) return;
    exportRef.current = true;
    setExportError(undefined);
    setExporting(true);
    void exportData()
      .catch(() => setExportError(t('auth.privacy.exportError')))
      .finally(() => {
        exportRef.current = false;
        setExporting(false);
      });
  }, [exportData, t]);
  const handleDelete = useCallback(
    (): void => navigation.navigate('DeleteAccount'),
    [navigation]
  );
  const handleCancelDeletion = useCallback((): void => {
    if (deletionRef.current) return;
    deletionRef.current = true;
    setDeletionError(undefined);
    setDeletionBusy(true);
    void cancelScheduledDeletion()
      .then(r => {
        // Azione GDPR consequenziale: se l'annullamento fallisce (rete/RLS) l'account
        // resta programmato per l'eliminazione a +30gg → mostrare l'errore, non ingoiarlo.
        if (r.error) setDeletionError(t('auth.delete.error'));
      })
      .finally(() => {
        deletionRef.current = false;
        setDeletionBusy(false);
      });
  }, [cancelScheduledDeletion, t]);
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

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginScreen />;
  }

  if (needsReConsent) {
    return <ReConsentScreen />;
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  // Nome paese localizzato dal cca2 (es. 'IT' → 'Italia'/'Italy').
  const countryName = profile?.country
    ? (getCountryByCca2(profile.country as ICountryCca2)?.translations?.[
        locale === 'it' ? 'ita' : 'eng'
      ]?.common ?? profile.country)
    : '';
  // Località: provincia solo se presente (i paesi esteri non l'hanno → niente "()" vuoto).
  const locationValue = profile
    ? profile.province
      ? `${profile.city} (${profile.province})`
      : profile.city
    : '';

  const deletionDate = getDeletionScheduledDate(
    profile?.deletion_requested_at,
    GRACE_DAYS
  );
  const scheduledDate = deletionDate
    ? formatDateLocalized(deletionDate, locale)
    : null;

  return (
    <AuthScreen title={t('auth.profile.title')}>
      {scheduledDate ? (
        <View style={styles.banner}>
          <PerfectText size={14} lines={2} style={styles.bannerText}>
            {`${t('auth.delete.banner')} ${scheduledDate}`}
          </PerfectText>
          <AuthButton
            label={t('auth.delete.bannerCancel')}
            onPress={handleCancelDeletion}
            variant="link"
            disabled={deletionBusy}
          />
          <FormError message={deletionError} size={13} style={styles.error} />
        </View>
      ) : null}

      {fullName ? (
        <PerfectText size={20} lines={1} style={styles.name}>
          {fullName}
        </PerfectText>
      ) : null}

      <Row
        label={t('auth.login.email')}
        value={session?.user.email ?? ''}
        styles={styles}
      />
      {profile ? (
        <>
          <Row
            label={t('auth.profile.phone')}
            value={profile.phone}
            styles={styles}
          />
          <Row
            label={t('auth.profile.location')}
            value={locationValue}
            styles={styles}
          />
          <Row
            label={t('auth.profile.country')}
            value={countryName}
            styles={styles}
          />
          <Row
            label={t('auth.profile.birthDate')}
            value={formatDateLocalized(profile.birth_date, locale)}
            styles={styles}
          />
        </>
      ) : null}

      {!profile ? (
        <AuthButton
          label={t('auth.profile.completeCta')}
          onPress={handleCompleteProfile}
        />
      ) : (
        <AuthButton
          label={t('auth.edit.title')}
          onPress={handleEditProfile}
          variant="link"
        />
      )}
      <AuthButton
        label={t('auth.profile.logout')}
        onPress={handleLogout}
        variant="link"
      />

      <PerfectText size={15} lines={1} style={styles.sectionTitle}>
        {t('auth.consents.title')}
      </PerfectText>
      <View style={styles.toggleRow}>
        <PerfectText size={15} lines={2} style={styles.toggleLabel}>
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
      <PerfectText size={13} lines={2} style={styles.hint}>
        {t('auth.consents.marketingHint')}
      </PerfectText>
      <FormError message={consentError} size={13} style={styles.error} />

      <PerfectText size={15} lines={1} style={styles.sectionTitle}>
        {t('auth.privacy.title')}
      </PerfectText>
      <AuthButton
        label={t('auth.privacy.exportCta')}
        onPress={handleExport}
        variant="link"
        disabled={exporting}
      />
      <FormError message={exportError} size={13} style={styles.error} />
      <AuthButton
        label={t('auth.privacy.deleteCta')}
        onPress={handleDelete}
        variant="link"
      />
    </AuthScreen>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}> = ({ label, value, styles }) => (
  <View style={styles.row}>
    <PerfectText size={13} lines={1} style={styles.rowLabel}>
      {label}
    </PerfectText>
    <PerfectText size={16} lines={2} style={styles.rowValue}>
      {value}
    </PerfectText>
  </View>
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.neutral[50],
    },
    banner: {
      backgroundColor: colors.neutral[100],
      borderRadius: scale(12),
      padding: PerfectSpacing.base,
      marginBottom: PerfectSpacing.lg,
    },
    bannerText: {
      color: colors.neutral[900],
      fontWeight: '600',
    },
    name: {
      color: colors.neutral[900],
      fontWeight: '700',
      marginBottom: PerfectSpacing.lg,
    },
    row: {
      marginBottom: PerfectSpacing.base,
    },
    rowLabel: {
      color: colors.neutral[500],
      marginBottom: PerfectSpacing.xs,
    },
    rowValue: {
      color: colors.neutral[900],
      fontWeight: '600',
    },
    sectionTitle: {
      color: colors.neutral[700],
      fontWeight: '700',
      marginTop: PerfectSpacing.xl,
      marginBottom: PerfectSpacing.xs,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      color: colors.neutral[900],
      flex: 1,
      marginRight: PerfectSpacing.base,
    },
    hint: {
      color: colors.neutral[500],
      marginTop: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
