import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { PerfectText } from '@/components/ui';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface AuthSubmitErrorProps {
  message: string | null | undefined;
  attempt: number;
  size?: number;
  style?: StyleProp<TextStyle>;
}

/** Un solo annuncio per errore, anche se il tentativo successivo ha lo stesso testo. */
export const AuthSubmitError: React.FC<AuthSubmitErrorProps> = ({
  message,
  attempt,
  size = 14,
  style,
}) => {
  const colors = useThemeColors();
  const announcedAttempt = useRef(attempt);
  useEffect(() => {
    // React può riunire più fallimenti in un render. Nei flussi concorrenti il
    // chiamante mantiene montato il componente anche quando message è vuoto.
    const announcements = Math.max(1, attempt - announcedAttempt.current);
    announcedAttempt.current = attempt;
    if (message) {
      for (let index = 0; index < announcements; index++) {
        AccessibilityInfo.announceForAccessibility(message);
      }
    }
  }, [message, attempt]);

  if (!message) return null;
  return (
    <View accessible accessibilityRole="alert" accessibilityLabel={message}>
      <PerfectText
        size={size}
        lines={0}
        style={[{ color: colors.semantic.error.text }, style]}
      >
        {message}
      </PerfectText>
    </View>
  );
};
