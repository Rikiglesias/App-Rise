import React, { useMemo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PlatformTouchable, PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'link';
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
          color={Colors.primary[600]}
          style={styles.linkText}
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
        colors={[Colors.primary[500], Colors.primary[600]]}
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
      overflow: 'hidden',
      marginTop: PerfectSpacing.sm,
    },
    btn: {
      paddingVertical: PerfectSpacing.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnText: {
      fontWeight: '700',
    },
    link: {
      alignItems: 'center',
      paddingVertical: PerfectSpacing.sm,
    },
    linkText: {
      fontWeight: '600',
    },
  });
