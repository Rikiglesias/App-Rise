import React, { useEffect } from 'react';
import {
  AccessibilityInfo,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';

interface FormSuccessProps {
  /** Messaggio di conferma; se assente/null/vuoto non renderizza nulla. */
  message?: string | null | undefined;
  size?: number;
  lines?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Conferma positiva di form/azione, coerente su tutte le schermate auth (DRY, gemello di
 * FormError, zero-O): glifo check ✓ come prefisso del testo, in live-region "polite" così
 * VoiceOver/TalkBack annunciano l'esito senza interrompere. Standardizza gli stati "riuscito"
 * prima grigi (neutral[700]) e incoerenti (finding 258).
 *
 * Il verde è THEME-AWARE per il contrasto (WCAG AA 1.4.3, review): i token `semantic` NON
 * sono adattati al tema, e `success.main` (#10B981) su sfondo chiaro dà solo ~2.4:1 (sotto
 * 4.5:1) → in light usiamo `success.dark` (#065F46 ≈ 8:1), in dark `success.main` (≈ 7:1).
 * Il check è dentro l'unica PerfectText (come FormError): niente riga/box separati che a
 * font-scale alto si disallineano (review, box a larghezza fissa di PerfectText multilinea).
 */
export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  size = 16,
  lines = 4,
  style,
}) => {
  const { isDark } = useUniversalTheme();
  // Annuncio cross-platform: `accessibilityLiveRegion` sotto è Android-only → su iOS
  // VoiceOver il successo sarebbe muto. Prima dell'early-return (hooks-rules).
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
  if (!message) return null;
  const color = isDark
    ? Colors.semantic.success.main
    : Colors.semantic.success.dark;
  return (
    <View accessibilityLiveRegion="polite">
      <PerfectText size={size} lines={lines} color={color} style={style}>
        {`✓ ${message}`}
      </PerfectText>
    </View>
  );
};
