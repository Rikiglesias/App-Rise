import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCountryByCca2, type ICountryCca2 } from 'rn-country-select';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
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
    setExportError(undefined);
    void exportData().catch(() =>
      setExportError(t('auth.privacy.exportError'))
    );
  }, [exportData, t]);
  const handleDelete = useCallback(
    (): void => navigation.navigate('DeleteAccount'),
    [navigation]
  );
  const handleCancelDeletion = useCallback((): void => {
    void cancelScheduledDeletion();
  }, [cancelScheduledDeletion]);
  const handleMarketingToggle = useCallback(
    (value: boolean): void => {
      setConsentError(undefined);
      void setMarketingConsent(value).then(r => {
        if (r.error) setConsentError(t('auth.consents.error'));
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
          />
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
            value={profile.birth_date}
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
      <AuthButton label={t('auth.profile.logout')} onPress={handleLogout} />

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
          accessibilityLabel={t('auth.consents.marketing')}
        />
      </View>
      <PerfectText size={13} lines={2} style={styles.hint}>
        {t('auth.consents.marketingHint')}
      </PerfectText>
      {consentError ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {consentError}
        </PerfectText>
      ) : null}

      <PerfectText size={15} lines={1} style={styles.sectionTitle}>
        {t('auth.privacy.title')}
      </PerfectText>
      <AuthButton
        label={t('auth.privacy.exportCta')}
        onPress={handleExport}
        variant="link"
      />
      {exportError ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {exportError}
        </PerfectText>
      ) : null}
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
