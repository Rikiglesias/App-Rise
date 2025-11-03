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
  const presentationStyle: 'fullScreen' | 'formSheet' | 'pageSheet' | 'overFullScreen' =
    size === 'fullscreen' ? 'fullScreen' : isTablet ? 'formSheet' : 'overFullScreen';

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

  return (
    <Modal
      {...modalProps}
      presentationStyle={presentationStyle}
      transparent={size !== 'fullscreen' && !isTablet}
    >
      {/* Overlay per modal non-fullscreen su phone */}
      {size !== 'fullscreen' && !isTablet && (
        <PerfectContainer style={styles.overlay} />
      )}

      {/* Container centrato */}
      <PerfectContainer
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
              height: dimensions.height as DimensionValue,
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
          {children}
        </PerfectContainer>
      </PerfectContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // rgba necessario per overlay semi-trasparente del modal
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
