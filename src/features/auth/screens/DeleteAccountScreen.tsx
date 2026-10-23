import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { AuthRetry } from '../components/AuthRetry';
import { useAuthError } from '../hooks/useAuthError';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';
import { CANCELLAZIONE_PROGRAMMATA_ATTIVA } from '@/shared/auth/deletionPolicy';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Eliminazione account (GDPR Art.17 + App Store 5.1.1(v)).
 * Doppia conferma (azione + Alert nativo).
 *
 * Erano previsti due modelli — immediato o programmato a +30gg — ma il secondo
 * è offerto solo se qualcuno esegue davvero l'eliminazione differita: vedi
 * `CANCELLAZIONE_PROGRAMMATA_ATTIVA` in `shared/auth/deletionPolicy.ts`, che
 * spiega perché oggi è spenta e cosa serve per riaccenderla. Il diritto alla
 * cancellazione resta servito da «Elimina subito», che cancella davvero.
 */
export const DeleteAccountScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { deleteAccountNow, scheduleDeletion } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [loading, setLoading] = useState(false);
  const { error, setError, reportError, showError, offline } =
    useAuthError('auth.delete.error');
  const [retryAction, setRetryAction] = useState<'now' | 'scheduled'>('now');

  const runDeleteNow = useCallback(async (): Promise<void> => {
    setError(undefined);
    setRetryAction('now');
    setLoading(true);
    // Nessun passaggio intermedio: con il login social rimosso non esiste più il
    // re-login Apple che serviva a ottenere l'authorizationCode per la revoca.
    //
    // `try/finally`: questa promessa può RIGETTARE, non solo tornare `{error}` —
    // la sessione vive in SecureStore e un errore di quello storage fa rilanciare
    // la libreria (stesso motivo per cui ProfileScreen ha un `.catch` sull'uscita).
    // Senza il `finally`, `setLoading(false)` non sarebbe mai arrivato: rotella che
    // gira all'infinito, nessun messaggio, e per giunta DOPO che l'account è già
    // stato cancellato.
    let esito: Awaited<ReturnType<typeof deleteAccountNow>> | null = null;
    try {
      esito = await deleteAccountNow();
    } catch (error) {
      showError(error);
      return;
    } finally {
      setLoading(false);
    }
    const { error: err, sessioneAncoraSulDispositivo } = esito;
    if (err) {
      showError(err);
      return;
    }
    // Su successo l'AuthContext porta lo stato a unauthenticated (signOut).
    // Ma quel signOut può fallire lasciando la sessione sul telefono, mentre i dati
    // sul server sono già stati eliminati: senza questo avviso l'app resterebbe
    // all'apparenza connessa a un account che non esiste più, e la persona non
    // avrebbe modo di capire perché. Non è un errore della cancellazione — infatti
    // il messaggio è diverso da quello di fallimento.
    if (sessioneAncoraSulDispositivo) setError(t('auth.delete.sessionResidua'));
  }, [deleteAccountNow, showError, setError, t]);

  const runSchedule = useCallback(async (): Promise<void> => {
    setError(undefined);
    setRetryAction('scheduled');
    setLoading(true);
    // Stesso motivo del gemello qui sopra: se la promessa rigetta, senza il
    // `finally` la rotella resterebbe a girare senza dire niente.
    let err: string | null = null;
    try {
      ({ error: err } = await scheduleDeletion());
    } catch (error) {
      showError(error);
      return;
    } finally {
      setLoading(false);
    }
    if (err) reportError(err);
    else navigation.goBack();
  }, [scheduleDeletion, navigation, reportError, showError, setError]);

  const goBack = useCallback((): void => navigation.goBack(), [navigation]);

  const confirmNow = useCallback((): void => {
    Alert.alert(t('auth.delete.title'), t('auth.delete.confirmNow'), [
      { text: t('auth.delete.cancel'), style: 'cancel' },
      {
        text: t('auth.delete.confirm'),
        style: 'destructive',
        onPress: () => void runDeleteNow(),
      },
    ]);
  }, [t, runDeleteNow]);

  const confirmSchedule = useCallback((): void => {
    Alert.alert(t('auth.delete.title'), t('auth.delete.confirmScheduled'), [
      { text: t('auth.delete.cancel'), style: 'cancel' },
      { text: t('auth.delete.confirm'), onPress: () => void runSchedule() },
    ]);
  }, [t, runSchedule]);

  return (
    <AuthScreen title={t('auth.delete.title')}>
      <PerfectText size={16} lines={6} style={styles.warning}>
        {t('auth.delete.warning')}
      </PerfectText>

      <AuthButton
        label={t('auth.delete.now')}
        onPress={confirmNow}
        loading={loading}
      />

      {CANCELLAZIONE_PROGRAMMATA_ATTIVA ? (
        <>
          <PerfectText size={13} lines={3} style={styles.hint}>
            {t('auth.delete.scheduledHint')}
          </PerfectText>
          <AuthButton
            label={t('auth.delete.scheduled')}
            onPress={confirmSchedule}
            variant="link"
            disabled={loading}
          />
        </>
      ) : null}

      {/* Nel cancello del profilo non ci sono né il pulsante indietro né l'indietro di
          sistema (C31): senza questa uscita chi apre la schermata per sbaglio resterebbe
          bloccato fino alla chiusura dell'app. */}
      {navigation.canGoBack() ? (
        <AuthButton
          label={t('auth.delete.cancel')}
          onPress={goBack}
          variant="link"
          disabled={loading}
        />
      ) : null}

      {error ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
      <AuthRetry
        visible={offline}
        onPress={retryAction === 'now' ? confirmNow : confirmSchedule}
        loading={loading}
      />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    warning: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    hint: {
      color: colors.neutral[500],
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing.xs,
    },
    error: {
      color: colors.semantic.error.text,
      marginTop: PerfectSpacing.base,
    },
  });
