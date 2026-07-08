import React from 'react';
import { View, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';

interface FormSuccessProps {
  /** Messaggio di conferma; se assente/null/vuoto non renderizza nulla. */
  message?: string | null | undefined;
  size?: number;
  lines?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Conferma positiva di form/azione, coerente su tutte le schermate auth (DRY, gemello di
 * FormError, zero-O): testo verde semantic.success + glifo check ✓, avvolto in una
 * live-region "polite" così VoiceOver/TalkBack annunciano l'esito senza interrompere.
 * Standardizza gli stati "riuscito" prima grigi (neutral[700]) e senza affordance,
 * incoerenti tra ForgotPassword/ResetPassword/SignUp e il verde di ProfileEdit (finding 258).
 */
export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  size = 16,
  lines = 4,
  style,
}) => {
  if (!message) return null;
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <PerfectText
        size={size}
        lines={1}
        color={Colors.semantic.success.main}
        style={styles.check}
      >
        {'✓'}
      </PerfectText>
      <View style={styles.textWrap}>
        <PerfectText
          size={size}
          lines={lines}
          containerWidth={0}
          color={Colors.semantic.success.main}
          style={style}
        >
          {message}
        </PerfectText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  check: { marginRight: 6 },
  textWrap: { flex: 1 },
});
