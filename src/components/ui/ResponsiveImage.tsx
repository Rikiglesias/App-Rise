// ===================================================================
// RESPONSIVE IMAGE COMPONENT - ADATTAMENTO AUTOMATICO
// Component che scala automaticamente immagini per tutti i dispositivi
// ===================================================================

import React from 'react';
import { Image, ImageProps, ImageStyle, Dimensions } from 'react-native';
import { getUniversalDeviceCategory } from '../../shared/constants/responsiveBreakpoints';
import { logDebug } from '../../shared/utils/logger';

// ===================================================================
// RESPONSIVE IMAGE INTERFACE
// ===================================================================

interface ResponsiveImageProps extends ImageProps {
  // Responsive configuration
  scaleMode?: 'auto' | 'disabled'; // Scaling mode
  phoneScale?: number; // Scale factor for phones (0.8 = 80%)
  tabletScale?: number; // Scale factor for tablets
  desktopScale?: number; // Scale factor for desktop
  debugMode?: boolean; // Debug scaling info
}

// ===================================================================
// RESPONSIVE IMAGE COMPONENT
// ===================================================================

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  style,
  scaleMode = 'auto',
  phoneScale = 1.0,
  tabletScale = 1.3,
  desktopScale = 1.6,
  debugMode = false,
  ...imageProps
}) => {
  // Calculate responsive dimensions
  const responsiveStyle = React.useMemo(() => {
    if (scaleMode === 'disabled') {
      return {};
    }

    const { width: screenWidth } = Dimensions.get('window');
    const device = getUniversalDeviceCategory(screenWidth);

    // Default scaling factors per device
    const scalingFactors = {
      extraSmall: phoneScale * 0.85, // iPhone SE - riduci
      small: phoneScale * 0.9, // Android standard
      mediumSmall: phoneScale * 0.95, // iPhone SE 2nd/3rd
      medium: phoneScale, // iPhone 14/13/12 - baseline
      mediumLarge: phoneScale, // iPhone 16 Pro
      large: phoneScale, // iPhone 11/XR
      extraLarge: phoneScale, // iPhone Pro Max
      huge: phoneScale, // iPhone 16 Pro Max
      premium: phoneScale, // Android Premium
      tabletSmall: tabletScale, // Tablet piccoli
      tablet: tabletScale * 1.2, // Tablet standard
      desktop: desktopScale, // Desktop
    };

    const scaleFactor = scalingFactors[device];

    // Process existing style
    const styleArray = (() => {
      if (Array.isArray(style)) {
        return style;
      }
      if (style) {
        return [style];
      }
      return [];
    })();
    const mergedStyle: ImageStyle = {};

    // Merge all styles
    styleArray.forEach(s => {
      if (s) {
        Object.assign(mergedStyle, s);
      }
    });

    // Apply scaling to width and height if they exist
    const responsiveStyleObj: ImageStyle = { ...mergedStyle };

    if (mergedStyle.width && typeof mergedStyle.width === 'number') {
      responsiveStyleObj.width = Math.round(mergedStyle.width * scaleFactor);
    }

    if (mergedStyle.height && typeof mergedStyle.height === 'number') {
      responsiveStyleObj.height = Math.round(mergedStyle.height * scaleFactor);
    }

    if (debugMode && __DEV__) {
      logDebug('ResponsiveImage', `${device} scale=${scaleFactor}`, {
        original: { width: mergedStyle.width, height: mergedStyle.height },
        responsive: {
          width: responsiveStyleObj.width,
          height: responsiveStyleObj.height,
        },
      });
    }

    return responsiveStyleObj;
  }, [style, scaleMode, phoneScale, tabletScale, desktopScale, debugMode]);

  return <Image style={responsiveStyle} {...imageProps} />;
};

// ===================================================================
// SHORTCUTS FOR COMMON USE CASES
// ===================================================================

const avatarDefaultStyle = {
  borderRadius: 999,
  width: 40,
  height: 40,
};

const heroImageDefaultStyle = {
  width: 300,
  height: 200,
};

const iconDefaultStyle = {
  width: 24,
  height: 24,
};

export const ResponsiveAvatar: React.FC<ResponsiveImageProps> = props => (
  <ResponsiveImage {...props} style={[avatarDefaultStyle, props.style]} />
);

export const ResponsiveHeroImage: React.FC<ResponsiveImageProps> = props => (
  <ResponsiveImage
    {...props}
    style={[heroImageDefaultStyle, props.style]}
    scaleMode="auto"
    phoneScale={1.0}
    tabletScale={1.2}
    desktopScale={1.5}
  />
);

export const ResponsiveIcon: React.FC<ResponsiveImageProps> = props => (
  <ResponsiveImage {...props} style={[iconDefaultStyle, props.style]} />
);

// ===================================================================
// COMPATIBILITY ALIASES
// ===================================================================

export { ResponsiveImage as RImage };
export { ResponsiveAvatar as RAvatar };
export { ResponsiveHeroImage as RHeroImage };
export { ResponsiveIcon as RIcon };

export default ResponsiveImage;
