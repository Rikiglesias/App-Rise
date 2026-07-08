import React, { useEffect } from 'react';
import {
  AccessibilityInfo,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { PerfectText } from '@/components/ui';

interface FormErrorProps {
  /** Messaggio d'errore; se assente/null/undefined/vuoto non renderizza nulla. */
  message?: string | null | undefined;
  size?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Errore di form/azione con annuncio agli screen reader: avvolge il testo in una
 * live-region assertive + role="alert", MA `accessibilityLiveRegion` è Android-only
 * → su iOS VoiceOver resterebbe muto. Quindi annuncia anche via
 * `AccessibilityInfo.announceForAccessibility` (cross-platform, come AuthInput) appena
 * il messaggio compare. Senza, l'errore è muto per chi non vede lo schermo. Riusato da
 * tutti gli screen auth per coerenza (DRY).
 */
export const FormError: React.FC<FormErrorProps> = ({
  message,
  size = 14,
  style,
}) => {
  // Prima dell'early-return (hooks-rules): l'annuncio è guardato dentro l'effect.
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
      <PerfectText size={size} lines={2} style={style}>
        {message}
      </PerfectText>
    </View>
  );
};
