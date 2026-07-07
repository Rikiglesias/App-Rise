import React from 'react';
import { View, type StyleProp, type TextStyle } from 'react-native';

import { PerfectText } from '@/components/ui';

interface FormErrorProps {
  /** Messaggio d'errore; se assente/null/undefined/vuoto non renderizza nulla. */
  message?: string | null | undefined;
  size?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Errore di form/azione con annuncio agli screen reader: avvolge il testo in una
 * live-region assertive + role="alert" così VoiceOver/TalkBack lo leggono appena
 * compare (es. "Email o password non corretti"). Senza, l'errore è muto per chi
 * non vede lo schermo. Riusato da tutti gli screen auth per coerenza (DRY).
 */
export const FormError: React.FC<FormErrorProps> = ({
  message,
  size = 14,
  style,
}) => {
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
      <PerfectText size={size} lines={2} style={style}>
        {message}
      </PerfectText>
    </View>
  );
};
