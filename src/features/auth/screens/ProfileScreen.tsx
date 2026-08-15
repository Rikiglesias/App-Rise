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
import { buildDisplayName } from '@/shared/auth/displayName';
import { getProfileCompletion } from '@/shared/auth/profileCompletion';
import type { RootStackNavigationProp } from '@/navigation/types';
import {
  formatDateLocalized,
  getDeletionScheduledDate,
} from '@/shared/utils/dateFormat';
import {
  GRACE_DAYS,
  CANCELLAZIONE_PROGRAMMATA_ATTIVA,
} from '@/shared/auth/deletionPolicy';

export const ProfileScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const {
    status,
    session,
    profile,
    profileLoaded,
    signOut,
    exportData,
    cancelScheduledDeletion,
    setMarketingConsent,
    needsReConsent,
  } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [exportError, setExportError] = useState<string | undefined>();
  const [consentError, setConsentError] = useState<string | undefined>();
  const [logoutError, setLogoutError] = useState<string | undefined>();

  // Se l'uscita fallisce la persona RESTA dentro l'account: tacere qui significa
  // lasciarle credere di essere uscita, che su un telefono condiviso è la bugia
  // peggiore che l'app possa dire. Quando riesce, non si mostra nulla: la schermata
  // sparisce da sé perché l'albero di navigazione cambia.
  // Il `.catch` non è ridondante: la sessione vive in SecureStore spezzata in blocchi
  // (`supabaseClient.ts` → `authStorage`), e un errore di quello storage fa RIGETTARE
  // la promessa invece di tornare `{error}`. Senza questo ramo non comparirebbe nessun
  // messaggio e resterebbe una promessa rifiutata a vuoto — cioè esattamente il caso
  // che questo fix esiste per eliminare, ricreato un livello più in là.
  const handleLogout = useCallback((): void => {
    setLogoutError(undefined);
    void signOut()
      .then(({ error }) => {
        if (error) setLogoutError(t('auth.profile.logoutError'));
      })
      .catch(() => setLogoutError(t('auth.profile.logoutError')));
  }, [signOut, t]);
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
  // Stesso metro di «Esci»: se l'annullamento non riesce, la cancellazione resta
  // programmata e il banner sparirebbe comunque al primo ricaricamento del
  // profilo — la persona resterebbe convinta di aver fermato la cancellazione del
  // proprio account mentre non l'ha fermata. Il `.catch` copre il rigetto della
  // promessa, non solo l'errore restituito.
  const [deletionCancelError, setDeletionCancelError] = useState<
    string | undefined
  >();
  const handleCancelDeletion = useCallback((): void => {
    setDeletionCancelError(undefined);
    void cancelScheduledDeletion()
      .then(({ error }) => {
        if (error) setDeletionCancelError(t('auth.delete.error'));
      })
      .catch(() => setDeletionCancelError(t('auth.delete.error')));
  }, [cancelScheduledDeletion, t]);
  const handleMarketingToggle = useCallback(
    (value: boolean): void => {
      setConsentError(undefined);
      // Gemello degli altri due handler di questa schermata: anche qui la promessa
      // può rigettare, e un consenso che non si è salvato deve dirlo — chi tocca
      // l'interruttore resterebbe altrimenti convinto di averlo cambiato.
      void setMarketingConsent(value)
        .then(r => {
          if (r.error) setConsentError(t('auth.consents.error'));
        })
        .catch(() => setConsentError(t('auth.consents.error')));
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

  // Stessa composizione del claim OIDC `name`: una sola definizione, così UI e
  // dato consegnato ai partner non possono divergere.
  const fullName = buildDisplayName(profile?.first_name, profile?.last_name);

  // Nome paese localizzato dal cca2 (es. 'IT' → 'Italia'/'Italy').
  const countryName = profile?.country
    ? (getCountryByCca2(profile.country as ICountryCca2)?.translations?.[
        locale === 'it' ? 'ita' : 'eng'
      ]?.common ?? profile.country)
    : '';
  // Un campo mai valorizzato (profilo minimo, migration 0010) si mostra come «da
  // completare», non come riga vuota: la riga vuota sembra un difetto dell'app, il
  // testo dice che manca qualcosa e che si può sistemare.
  const toComplete = t('auth.profile.toComplete');
  // Località: provincia solo se presente (i paesi esteri non l'hanno → niente "()" vuoto).
  const locationValue = profile
    ? profile.city
      ? profile.province
        ? `${profile.city} (${profile.province})`
        : profile.city
      : toComplete
    : '';
  // Profilo esistente ma con campi ancora da raccogliere: la CTA deve comparire anche
  // in questo caso, non solo quando il profilo manca del tutto (P2).
  // `profileLoaded`, non `status`: lo status si alza appena la sessione è nota, cioè
  // PRIMA che la lettura del profilo torni — passandolo qui lo stato `unknown` non
  // si verificava mai e «sto ancora leggendo» diventava «non ce l'ha».
  const isProfileIncomplete =
    getProfileCompletion(profile, profileLoaded) === 'incomplete';

  const deletionDate = getDeletionScheduledDate(
    profile?.deletion_requested_at,
    GRACE_DAYS
  );
  const scheduledDate = deletionDate
    ? formatDateLocalized(deletionDate, locale)
    : null;

  return (
    <AuthScreen title={t('auth.profile.title')}>
      {/* Anche il banner sta dietro la costante, non solo il pulsante che avvia la
          programmazione: finché nessuno esegue l'eliminazione differita, questa è
          l'ultima riga dell'app che continuerebbe a dire «eliminazione programmata
          il <data>» — cioè la frase falsa che la costante è nata per togliere, e per
          giunta con una data che nel frattempo è passata. */}
      {CANCELLAZIONE_PROGRAMMATA_ATTIVA && scheduledDate ? (
        <View style={styles.banner}>
          <PerfectText size={14} lines={2} style={styles.bannerText}>
            {`${t('auth.delete.banner')} ${scheduledDate}`}
          </PerfectText>
          <AuthButton
            label={t('auth.delete.bannerCancel')}
            onPress={handleCancelDeletion}
            variant="link"
          />
          {deletionCancelError ? (
            <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
              <PerfectText size={13} lines={2} style={styles.bannerError}>
                {deletionCancelError}
              </PerfectText>
            </View>
          ) : null}
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
            value={profile.phone ?? toComplete}
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

      {/* Finché la lettura è in volo non si mostra NESSUNO dei due pulsanti: `!profile`
          è vero anche per chi il profilo ce l'ha, quindi comparirebbe «Completa il tuo
          profilo» a chi è già a posto — e mostrare «Modifica profilo» a chi non ne ha
          uno è l'errore opposto. Un pulsante che cambia sotto il dito è peggio di un
          pulsante che arriva un istante dopo. Stesso difetto chiuso in
          `getProfileCompletion`, su una riga diversa: il gemello va cercato. */}
      {!profileLoaded ? null : !profile || isProfileIncomplete ? (
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
      {logoutError ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {logoutError}
        </PerfectText>
      ) : null}

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
    bannerError: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
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
