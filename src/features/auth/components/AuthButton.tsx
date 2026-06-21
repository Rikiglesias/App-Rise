import React, { useMemo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PlatformTouchable, PerfectText } from '@/components/ui';
import { Colors, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const styles = useMemo(() => createStyles(), []);

  if (variant === 'link') {
    return (
      <PlatformTouchable
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        style={styles.link}
      >
        <PerfectText
          size={15}
          lines={1}
          color={Colors.primary[500]}
          style={styles.linkText}
        >
          {label}
        </PerfectText>
      </PlatformTouchable>
    );
  }

  if (variant === 'secondary') {
    return (
      <PlatformTouchable
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        style={[styles.secondaryBtn, disabled ? styles.btnDisabled : null]}
      >
        <PerfectText
          size={16}
          lines={1}
          color={Colors.primary[500]}
          style={styles.secondaryText}
        >
          {label}
        </PerfectText>
      </PlatformTouchable>
    );
  }

  const isOff = disabled || loading;
  return (
    <PlatformTouchable
      onPress={onPress}
      disabled={isOff}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={styles.btnWrap}
    >
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, isOff ? styles.btnDisabled : null]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.accent.white} />
        ) : (
          <PerfectText
            size={16}
            lines={1}
            color={Colors.accent.white}
            style={styles.btnText}
          >
            {label}
          </PerfectText>
        )}
      </LinearGradient>
    </PlatformTouchable>
  );
};

const createStyles = () =>
  StyleSheet.create({
    btnWrap: {
      borderRadius: scale(12),
      marginTop: PerfectSpacing.sm,
      ...Shadows.primary,
    },
    btn: {
      paddingVertical: PerfectSpacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(12),
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnText: {
      fontWeight: '700',
    },
    // Bottone secondario: stessa forma/dimensione del primario ma con bordo
    // brand (outline). Dà struttura e rende "Registrati" pari ad "Accedi"
    // invece di un link minuscolo.
    secondaryBtn: {
      marginTop: PerfectSpacing.md,
      borderRadius: scale(12),
      borderWidth: scale(1.5),
      borderColor: Colors.primary[500],
      paddingVertical: PerfectSpacing.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      fontWeight: '700',
    },
    link: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: scale(48),
      paddingVertical: PerfectSpacing.sm,
    },
    linkText: {
      fontWeight: '600',
    },
  });
