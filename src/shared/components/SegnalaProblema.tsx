/**
 * «Segnala un problema» (C55): prepara una mail con la diagnosi letta AL TOCCO.
 *
 * Vive anche nella schermata d'errore di ErrorBoundary, cioè FUORI dai provider:
 * per questo usa i primitivi di React Native invece di PerfectText (che senza
 * UniversalThemeProvider lancia) e legge il tema solo se c'è: nelle schermate
 * dell'account segue chiaro/scuro come AuthScreen, nella schermata d'errore
 * (sfondo bianco) usa la scala chiara.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { PressableStateCallbackType } from 'react-native';

import { RISE_CONTACTS } from '@/shared/constants/urls';
import { scaleText } from '@/shared/utils/textScale';
import { getImmuneTextProps } from '@/shared/utils/SystemImmunity';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { buildProblemMailto } from '@/shared/utils/buildProblemMailto';
import { useProblemReport } from '@/shared/utils/collectProblemReport';
import { minimumTouchTarget } from '@/shared/utils/minimumTouchTarget';
import { isSuccess } from '@/shared/utils/result';
import { getAdaptiveColors } from '@/shared/theme/adaptiveColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useOptionalUniversalTheme } from '@/shared/theme/UniversalTheme';

export const SegnalaProblema: React.FC = () => {
  const { t } = useTranslation();
  const isDark = useOptionalUniversalTheme()?.isDark ?? false;
  const styles = useMemo(
    () => createStyles(getAdaptiveColors(isDark)),
    [isDark]
  );
  const { openLink } = useLinkHandler();
  const readReport = useProblemReport();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  // Testo da condividere quando la posta non si apre: è lo stesso letto al tocco,
  // così la diagnosi non cambia (né si perde) fra il rifiuto e «Condividi».
  const [fallback, setFallback] = useState<string | null>(null);
  const [shareFailed, setShareFailed] = useState(false);
  const emailError = t('links.errors.email', { email: RISE_CONTACTS.email });

  const handlePress = useCallback(async (): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFallback(null);
    setShareFailed(false);
    let body = '';
    let opened = false;
    try {
      const report = readReport();
      body = report.body;
      const { url } = buildProblemMailto(report, t('support.reportSubject'));
      opened = isSuccess(await openLink(url, 'report-problem', emailError));
    } catch {
      // RangeError: neanche i soli metadati stanno nei 2000 caratteri dell'URL.
      // Oppure la diagnosi non si legge (su web manca `Platform.constants`): fuori
      // dal try il pulsante resterebbe disattivato per sempre. Il tocco non deve
      // mai lanciare: vale come apertura rifiutata, e resta almeno l'indirizzo.
      opened = false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
    if (!opened) setFallback(body);
  }, [emailError, openLink, readReport, t]);

  // Stessa guardia del tocco principale: su Android due tocchi rapidi aprirebbero
  // due selettori di app uno sopra l'altro.
  const shareInFlight = useRef(false);
  const [sharing, setSharing] = useState(false);
  const handleShare = useCallback(async (): Promise<void> => {
    if (fallback === null || shareInFlight.current) return;
    shareInFlight.current = true;
    setSharing(true);
    setShareFailed(false);
    try {
      await Share.share({ message: fallback });
    } catch {
      setShareFailed(true);
    } finally {
      shareInFlight.current = false;
      setSharing(false);
    }
  }, [fallback]);

  // Il testo fuori dai provider non può usare PerfectText: prende comunque le
  // stesse regole di scala del Perfect System, che sono funzioni pure.
  const textProps = getImmuneTextProps();
  const buttonStyle =
    (pending: boolean) =>
    ({ pressed }: PressableStateCallbackType) => [
      styles.button,
      minimumTouchTarget(),
      (pressed || pending) && styles.pressed,
    ];

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('support.reportProblem')}
        accessibilityState={{ busy, disabled: busy }}
        disabled={busy}
        onPress={() => void handlePress()}
        style={buttonStyle(busy)}
      >
        <Text {...textProps} style={styles.label}>
          {t('support.reportProblem')}
        </Text>
      </Pressable>
      {fallback !== null ? (
        <>
          <Text
            {...textProps}
            accessibilityLiveRegion="polite"
            style={styles.message}
          >
            {emailError}
          </Text>
          {/* Senza diagnosi non c'è niente da condividere: resta l'indirizzo. */}
          {fallback ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('support.shareText')}
              accessibilityState={{ busy: sharing, disabled: sharing }}
              disabled={sharing}
              onPress={() => void handleShare()}
              style={buttonStyle(sharing)}
            >
              <Text {...textProps} style={styles.label}>
                {t('support.shareText')}
              </Text>
            </Pressable>
          ) : null}
          {shareFailed ? (
            <Text
              {...textProps}
              accessibilityLiveRegion="polite"
              style={styles.message}
            >
              {t('support.shareError')}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

// Contrasto sullo sfondo di AuthScreen (neutral[50]) e sul bianco: neutral[600]
// ≈ 7,6:1 in chiaro e ≈ 7:1 in scuro, neutral[800] oltre 13:1 in entrambi.
// L'opacità del tocco vale solo per l'istante della pressione o dell'attesa.
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    pressed: {
      opacity: 0.6,
    },
    label: {
      color: colors.neutral[600],
      fontSize: scaleText(15),
      textDecorationLine: 'underline',
    },
    message: {
      color: colors.neutral[800],
      fontSize: scaleText(14),
      textAlign: 'center',
    },
  });
