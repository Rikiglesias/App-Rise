import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCountryByCca2, type ICountryCca2 } from 'rn-country-select';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { SettingsGroup, SettingsRow } from '../components/SettingsRow';
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
import { usePostAuthRedirect } from '@/shared/auth/usePostAuthRedirect';
import type { RootStackNavigationProp } from '@/navigation/types';
import {
  formatDateLocalized,
  getDeletionScheduledDate,
} from '@/shared/utils/dateFormat';

const GRACE_DAYS = 30;
// Apple "Hide My Email" fornisce una relay @privaterelay.appleid.com al posto della
// vera mail: mostrarla grezza nel profilo è confuso (l'utente non la riconosce come
// sua). La rileviamo per sostituirla con un'etichetta leggibile.
const APPLE_RELAY_SUFFIX = '@privaterelay.appleid.com';

export const ProfileScreen: React.FC = () => {
  // Nav post-login: al primo accesso qui redirige a Home (profilo completo) o
  // CompleteProfile (social 1ª volta), invece di restare sulla schermata Profilo.
  usePostAuthRedirect();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const {
    status,
    session,
    profile,
    signOut,
    cancelScheduledDeletion,
    needsReConsent,
  } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [deletionError, setDeletionError] = useState<string | undefined>();
  // Guardia anti doppio-invio dell'annullamento cancellazione: ref sincrono (regge
  // due tap nello stesso frame), lo state pilota solo il feedback visivo (disabled).
  const deletionRef = useRef(false);
  const [deletionBusy, setDeletionBusy] = useState(false);

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
  const handleConsents = useCallback(
    (): void => navigation.navigate('Consents'),
    [navigation]
  );
  const handlePrivacy = useCallback(
    (): void => navigation.navigate('Privacy'),
    [navigation]
  );
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

  // Re-consenso SOLO per utenti già stabiliti (con profilo). Un signup social nuovo ha zero
  // consent_events e nessun profilo → needsReConsent sarebbe true, ma mostrargli "l'informativa
  // è cambiata, ri-accetta" è copy sbagliata (non ha MAI acconsentito) e creerebbe un evento
  // privacy_notice duplicato oltre a quello della RPC di completamento profilo. Senza profilo
  // deve andare a CompleteProfile, dove acconsente correttamente (review round 4).
  if (profile && needsReConsent) {
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

  const marketingStatus = profile?.marketing_consent
    ? t('auth.consents.statusOn')
    : t('auth.consents.statusOff');

  const accountEmail = session?.user.email ?? '';
  const emailDisplay = accountEmail.endsWith(APPLE_RELAY_SUFFIX)
    ? t('auth.profile.applePrivateEmail')
    : accountEmail;

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

      {/* Blocco identità: nome + email. È l'header dati del profilo. */}
      {fullName ? (
        <PerfectText size={22} lines={1} style={styles.name}>
          {fullName}
        </PerfectText>
      ) : null}
      <PerfectText size={15} lines={1} style={styles.email}>
        {emailDisplay}
      </PerfectText>

      {profile ? (
        <>
          {/* Card dati anagrafici (sola lettura). */}
          <View style={styles.dataCard}>
            <DataRow
              label={t('auth.profile.phone')}
              value={profile.phone}
              styles={styles}
              divider
            />
            <DataRow
              label={t('auth.profile.location')}
              value={locationValue}
              styles={styles}
              divider
            />
            <DataRow
              label={t('auth.profile.country')}
              value={countryName}
              styles={styles}
              divider
            />
            <DataRow
              label={t('auth.profile.birthDate')}
              value={formatDateLocalized(profile.birth_date, locale)}
              styles={styles}
            />
          </View>

          {/* Menu gestione: ogni voce apre la sua sotto-pagina dedicata. */}
          <PerfectText size={13} lines={1} style={styles.sectionTitle}>
            {t('auth.profile.manageTitle')}
          </PerfectText>
          <SettingsGroup>
            <SettingsRow
              label={t('auth.edit.title')}
              onPress={handleEditProfile}
              showDivider
            />
            <SettingsRow
              label={t('auth.consents.title')}
              subtitle={marketingStatus}
              onPress={handleConsents}
              showDivider
            />
            <SettingsRow
              label={t('auth.privacy.title')}
              subtitle={t('auth.privacy.rowSubtitle')}
              onPress={handlePrivacy}
              showDivider
            />
            <SettingsRow
              label={t('auth.delete.title')}
              onPress={handleDelete}
              destructive
            />
          </SettingsGroup>
        </>
      ) : (
        <AuthButton
          label={t('auth.profile.completeCta')}
          onPress={handleCompleteProfile}
        />
      )}

      <AuthButton
        label={t('auth.profile.logout')}
        onPress={handleLogout}
        variant="link"
      />
    </AuthScreen>
  );
};

const DataRow: React.FC<{
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
  divider?: boolean;
}> = ({ label, value, styles, divider = false }) => (
  <View style={[styles.dataRow, divider ? styles.dataRowDivider : null]}>
    <PerfectText size={13} lines={1} style={styles.dataLabel}>
      {label}
    </PerfectText>
    <PerfectText size={16} lines={2} style={styles.dataValue}>
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
    },
    email: {
      color: colors.neutral[500],
      marginTop: scale(2),
      marginBottom: PerfectSpacing.lg,
    },
    dataCard: {
      backgroundColor: colors.neutral[0],
      borderRadius: scale(14),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      paddingHorizontal: PerfectSpacing.base,
    },
    dataRow: {
      paddingVertical: PerfectSpacing.md,
    },
    dataRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.neutral[200],
    },
    dataLabel: {
      color: colors.neutral[500],
      marginBottom: PerfectSpacing.xs,
    },
    dataValue: {
      color: colors.neutral[900],
      fontWeight: '600',
    },
    sectionTitle: {
      color: colors.neutral[500],
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: scale(0.5),
      marginTop: PerfectSpacing.xl,
      marginBottom: PerfectSpacing.sm,
      marginLeft: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
