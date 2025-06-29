// ===================================================================
// RESPONSIVE MODAL COMPONENT - ADATTAMENTO AUTOMATICO
// Component che adatta automaticamente modal per tutti i dispositivi
// ===================================================================

import React from 'react';
import { Modal, ModalProps, View, ViewStyle, Dimensions } from 'react-native';
import { getUniversalDeviceCategory } from '../../shared/constants/responsiveBreakpoints';
import {
  migrateSpacing,
  getResponsiveValue,
} from '../../shared/utils/responsiveMigration';

// ===================================================================
// RESPONSIVE MODAL INTERFACE
// ===================================================================

interface ResponsiveModalProps extends ModalProps {
  children: React.ReactNode;

  // Container style overrides
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;

  // Responsive configuration
  responsiveMode?: 'auto' | 'disabled'; // Enable/disable responsive behavior

  // Size variants
  sizeVariant?: 'small' | 'medium' | 'large' | 'fullscreen' | 'custom';

  // Device-specific overrides
  phoneSizeRatio?: number; // Width ratio for phones (0.9 = 90% of screen)
  tabletSizeRatio?: number; // Width ratio for tablets
  desktopSizeRatio?: number; // Width ratio for desktop

  // Padding overrides
  customPadding?: number;

  // Background and overlay
  overlayColor?: string;

  // Debug
  debugMode?: boolean;
}

// ===================================================================
// RESPONSIVE MODAL COMPONENT
// ===================================================================

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  children,
  containerStyle,
  contentStyle,
  responsiveMode = 'auto',
  sizeVariant = 'medium',
  phoneSizeRatio: _phoneSizeRatio = 0.9,
  tabletSizeRatio: _tabletSizeRatio = 0.7,
  desktopSizeRatio: _desktopSizeRatio = 0.5,
  customPadding,
  overlayColor = 'rgba(0, 0, 0, 0.6)',
  debugMode = false,
  ...modalProps
}) => {
  const responsiveStyles = React.useMemo(() => {
    if (responsiveMode === 'disabled') {
      return {
        container: containerStyle ?? {},
        content: contentStyle ?? {},
      };
    }

    const { width: screenWidth, height: screenHeight } =
      Dimensions.get('window');
    const device = getUniversalDeviceCategory(screenWidth);

    // Size configurations per variant
    const sizeConfigs = {
      small: { widthRatio: 0.8, maxHeightRatio: 0.6, padding: 16 },
      medium: { widthRatio: 0.9, maxHeightRatio: 0.8, padding: 20 },
      large: { widthRatio: 0.95, maxHeightRatio: 0.9, padding: 24 },
      fullscreen: { widthRatio: 1.0, maxHeightRatio: 1.0, padding: 0 },
      custom: {
        widthRatio: 0.9,
        maxHeightRatio: 0.8,
        padding: customPadding ?? 20,
      },
    };

    const baseConfig = sizeConfigs[sizeVariant];
    const finalWidth = screenWidth * baseConfig.widthRatio;
    const finalMaxHeight = screenHeight * baseConfig.maxHeightRatio;
    const responsivePadding = getResponsiveValue(
      migrateSpacing(baseConfig.padding)
    );

    if (debugMode && __DEV__) {
      // eslint-disable-next-line no-console
      console.log(`🔄 ResponsiveModal: ${device} ${sizeVariant}`, {
        screenSize: { width: screenWidth, height: screenHeight },
        modalSize: { width: finalWidth, maxHeight: finalMaxHeight },
        padding: responsivePadding,
      });
    }

    const containerStyles: ViewStyle = {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: overlayColor,
      paddingHorizontal: responsivePadding,
      paddingVertical: responsivePadding,
      ...containerStyle,
    };

    const contentStyles: ViewStyle = {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: responsivePadding,
      width: finalWidth,
      maxHeight: finalMaxHeight,
      maxWidth: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      ...contentStyle,
    };

    return {
      container: containerStyles,
      content: contentStyles,
    };
  }, [
    responsiveMode,
    sizeVariant,
    customPadding,
    overlayColor,
    containerStyle,
    contentStyle,
    debugMode,
  ]);

  return (
    <Modal {...modalProps}>
      <View style={responsiveStyles.container}>
        <View style={responsiveStyles.content}>{children}</View>
      </View>
    </Modal>
  );
};

// ===================================================================
// SHORTCUTS FOR COMMON USE CASES
// ===================================================================

const bottomSheetContainerStyle = {
  justifyContent: 'flex-end' as const,
  paddingTop: 100, // Safe area for status bar
};

const bottomSheetContentStyle = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  width: '100%' as const,
  maxHeight: '70%' as const,
};

export const ResponsiveAlertModal: React.FC<ResponsiveModalProps> = props => (
  <ResponsiveModal {...props} sizeVariant="small" />
);

export const ResponsiveContentModal: React.FC<ResponsiveModalProps> = props => (
  <ResponsiveModal {...props} sizeVariant="medium" />
);

export const ResponsiveFullModal: React.FC<ResponsiveModalProps> = props => (
  <ResponsiveModal {...props} sizeVariant="large" />
);

export const ResponsiveBottomSheet: React.FC<ResponsiveModalProps> = props => (
  <ResponsiveModal
    {...props}
    sizeVariant="custom"
    containerStyle={{
      ...bottomSheetContainerStyle,
      ...props.containerStyle,
    }}
    contentStyle={{
      ...bottomSheetContentStyle,
      ...props.contentStyle,
    }}
  />
);

// ===================================================================
// COMPATIBILITY ALIASES
// ===================================================================

export { ResponsiveModal as RModal };
export { ResponsiveAlertModal as RAlertModal };
export { ResponsiveContentModal as RContentModal };
export { ResponsiveFullModal as RFullModal };
export { ResponsiveBottomSheet as RBottomSheet };

export default ResponsiveModal;
