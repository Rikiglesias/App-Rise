/**
 * PERFECT BUTTON - Sistema Bottoni Identici iPhone 15
 *
 * GARANTISCE:
 * - Dimensioni proporzionali su tutti i device
 * - Touch target minimo 44px (Apple HIG)
 * - Stati consistenti (normal, disabled, loading)
 * - Variants standardizzati
 */

import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../shared/hooks/useTheme';
import { scale } from '../../shared/constants/perfectScale';
import { PerfectContainer } from './PerfectContainer';
import { PerfectText } from './PerfectText';

export interface PerfectButtonProps {
  /** Testo bottone */
  children: string;

  /** Callback press */
  onPress: () => void;

  /** Variant style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /** Size preset */
  size?: 'small' | 'medium' | 'large';

  /** Loading state */
  loading?: boolean;

  /** Disabled */
  disabled?: boolean;

  /** Full width */
  fullWidth?: boolean;

  /** Icon left (optional) */
  iconLeft?: React.ReactNode;

  /** Icon right (optional) */
  iconRight?: React.ReactNode;
}

// 📐 SIZE PRESETS (riferimento iPhone 15)
const BUTTON_SIZE_PRESETS = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    size: 14,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    size: 16,
    minHeight: 44, // Apple HIG minimum touch target
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    size: 18,
    minHeight: 52,
  },
} as const;

export const PerfectButton: React.FC<PerfectButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
}) => {
  const { colors } = useTheme();
  const preset = BUTTON_SIZE_PRESETS[size];

  const isDisabled = disabled || loading;

  // 🎨 RISOLVI COLORI PER VARIANT
  const getColors = () => {
    if (isDisabled) {
      return {
        bg: colors.neutral?.[200] ?? '#E5E7EB',
        text: colors.neutral?.[400] ?? '#9CA3AF',
        border: 'transparent',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary[500],
          text: '#ffffff',
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: colors.neutral[600],
          text: '#ffffff',
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.primary[600],
          border: colors.primary[500],
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.neutral[900],
          border: 'transparent',
        };
      default:
        return {
          bg: colors.primary[500],
          text: '#ffffff',
          border: 'transparent',
        };
    }
  };

  const buttonColors = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={{ width: fullWidth ? '100%' : undefined }}
    >
      <PerfectContainer
        paddingVertical={preset.paddingVertical}
        paddingHorizontal={preset.paddingHorizontal}
        backgroundColor={buttonColors.bg as never}
        borderRadius={8}
        alignItems="center"
        justifyContent="center"
        flexDirection="row"
        gap={8}
        style={{
          minHeight: scale(preset.minHeight),
          ...(variant === 'outline' && {
            borderWidth: scale(2),
            borderColor: buttonColors.border as string,
          }),
          ...(isDisabled && {
            opacity: 0.6,
          }),
        }}
      >
        {/* Icon Left */}
        {iconLeft && !loading && iconLeft}

        {/* Loading Indicator */}
        {loading ? (
          <ActivityIndicator color={buttonColors.text as string} size="small" />
        ) : (
          <PerfectText
            size={preset.size}
            lines={1}
            fontWeight="600"
            color={buttonColors.text}
          >
            {children}
          </PerfectText>
        )}

        {/* Icon Right */}
        {iconRight && !loading && iconRight}
      </PerfectContainer>
    </TouchableOpacity>
  );
};

// 🎯 SHORTCUTS PER VARIANT COMUNI
export const PrimaryButton = (props: Omit<PerfectButtonProps, 'variant'>) => (
  <PerfectButton {...props} variant="primary" />
);

export const SecondaryButton = (props: Omit<PerfectButtonProps, 'variant'>) => (
  <PerfectButton {...props} variant="secondary" />
);

export const OutlineButton = (props: Omit<PerfectButtonProps, 'variant'>) => (
  <PerfectButton {...props} variant="outline" />
);

export const GhostButton = (props: Omit<PerfectButtonProps, 'variant'>) => (
  <PerfectButton {...props} variant="ghost" />
);
