/**
 * PERFECT MODAL - Modal Responsive e Scalato
 *
 * GARANTISCE:
 * - Modal adattivo phone vs tablet
 * - Dimensioni proporzionali scalate
 * - Presentazione ottimale per device
 */

import React from 'react';
import {
  Modal,
  type ModalProps,
  StyleSheet,
  useWindowDimensions,
  type DimensionValue,
} from 'react-native';

import { PerfectContainer } from './PerfectContainer';
import { PlatformScrollView, PlatformTouchable } from './PlatformComponents';
import { Colors, scale } from '@/shared/constants';

interface PerfectModalProps extends Omit<ModalProps, 'children'> {
  /** Contenuto modal */
  children: React.ReactNode;

  /** Size preset */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /** Padding interno (riferimento iPhone 15) */
  padding?: number;

  /** Background color */
  backgroundColor?: string;

  /** Border radius (riferimento iPhone 15) */
  borderRadius?: number;

  /** Custom style per container */
  containerStyle?: import('react-native').ViewStyle;

  /** Bordo in stile "La Nostra Community" */
  outlined?: boolean;
  /** Colore bordo (default: neutral[300]) */
  outlineColor?: string;
}

/**
 * Calcola comportamento responsive del modal
 */
const useModalBehavior = (size: PerfectModalProps['size']) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // iPad e superiori
  const isPhablet = width >= 600 && width < 768; // Device grandi

  // 📐 DIMENSIONI RESPONSIVE
  const modalSizes = {
    small: {
      width: isTablet ? '50%' : isPhablet ? '70%' : '85%',
      maxWidth: isTablet ? 500 : undefined,
      height: 'auto' as const,
    },
    medium: {
      width: isTablet ? '70%' : isPhablet ? '85%' : '90%',
      maxWidth: isTablet ? 700 : undefined,
      height: 'auto' as const,
    },
    large: {
      width: isTablet ? '85%' : isPhablet ? '95%' : '95%',
      maxWidth: isTablet ? 900 : undefined,
      height: 'auto' as const,
    },
    fullscreen: {
      width: '100%',
      maxWidth: undefined,
      height: '100%',
    },
  };

  // 🎨 PRESENTATION STYLE
  // iOS note: 'transparent' is not supported with 'pageSheet'.
  // For phones (non-tablet) we use 'overFullScreen' to support semi-transparent overlays.
  const presentationStyle:
    | 'fullScreen'
    | 'formSheet'
    | 'pageSheet'
    | 'overFullScreen' =
    size === 'fullscreen'
      ? 'fullScreen'
      : isTablet
        ? 'formSheet'
        : 'overFullScreen';

  return {
    dimensions: modalSizes[size || 'medium'],
    presentationStyle,
    isTablet,
  };
};

export const PerfectModal: React.FC<PerfectModalProps> = ({
  children,
  size = 'medium',
  padding = 20,
  backgroundColor,
  borderRadius = 16,
  containerStyle,
  outlined = false,
  outlineColor,
  ...modalProps
}) => {
  const { dimensions, presentationStyle, isTablet } = useModalBehavior(size);
  const { height } = useWindowDimensions();
  const safeMaxHeight =
    size === 'fullscreen'
      ? undefined
      : Math.max(0, Math.floor(height - scale(32)));

  const needsBackdrop = size !== 'fullscreen' && !isTablet;

  return (
    <Modal
      {...modalProps}
      presentationStyle={presentationStyle}
      transparent={needsBackdrop}
      animationType={modalProps.animationType || 'fade'}
      statusBarTranslucent
    >
      {/* Backdrop unificato per modal non-fullscreen su phone */}
      {needsBackdrop && (
        <PlatformTouchable
          style={styles.backdropOverlay}
          onPress={modalProps.onRequestClose}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Chiudi modale"
        >
          <PerfectContainer style={StyleSheet.absoluteFillObject} />
        </PlatformTouchable>
      )}

      {/* Container centrato */}
      <PerfectContainer
        pointerEvents="box-none"
        style={[
          styles.modalWrapper,
          ...(size === 'fullscreen' ? [styles.fullscreen] : []),
        ]}
      >
        <PerfectContainer
          padding={padding}
          borderRadius={size === 'fullscreen' ? 0 : borderRadius}
          style={[
            {
              width: dimensions.width as DimensionValue,
              maxWidth: dimensions.maxWidth,
              ...(dimensions.height === 'auto'
                ? {}
                : { height: dimensions.height as DimensionValue }),
              ...(safeMaxHeight !== undefined
                ? { maxHeight: safeMaxHeight as unknown as DimensionValue }
                : {}),
              backgroundColor: backgroundColor || Colors.neutral[0],
            },
            ...(outlined
              ? [
                  {
                    borderWidth: scale(1),
                    borderColor: outlineColor || Colors.neutral[300],
                  },
                ]
              : []),
            ...(containerStyle ? [containerStyle] : []),
          ]}
        >
          {size === 'fullscreen' ? (
            <>{children}</>
          ) : (
            <PlatformScrollView
              style={safeMaxHeight ? { maxHeight: safeMaxHeight } : undefined}
              contentContainerStyle={{ paddingBottom: 0 }}
              bounces={false}
              showsVerticalScrollIndicator
            >
              {children}
            </PlatformScrollView>
          )}
        </PerfectContainer>
      </PerfectContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  fullscreen: {
    justifyContent: 'flex-start' as const,
    alignItems: 'stretch' as const,
  },
});

// 🎯 SHORTCUTS per size comuni
export const SmallModal = (props: Omit<PerfectModalProps, 'size'>) => (
  <PerfectModal {...props} size="small" />
);

export const MediumModal = (props: Omit<PerfectModalProps, 'size'>) => (
  <PerfectModal {...props} size="medium" />
);

export const LargeModal = (props: Omit<PerfectModalProps, 'size'>) => (
  <PerfectModal {...props} size="large" />
);

export const FullscreenModal = (props: Omit<PerfectModalProps, 'size'>) => (
  <PerfectModal {...props} size="fullscreen" />
);
