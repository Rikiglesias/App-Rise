// ===================================================================
// RESPONSIVE WRAPPER UNIVERSALE - MIGRAZIONE AUTOMATICA
// Wrapper che può rendere responsive qualsiasi componente esistente
// ===================================================================

import React from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import {
  migrateFontSize,
  migrateSpacing,
  getResponsiveValue,
} from '../../shared/utils/responsiveMigration';

// ===================================================================
// RESPONSIVE WRAPPER INTERFACE
// ===================================================================

interface ResponsiveWrapperProps {
  children: React.ReactElement;

  // Responsive configuration
  enableFontScaling?: boolean;
  enableSpacingScaling?: boolean;
  enableDimensionScaling?: boolean;

  // Override options
  fontScaleOverride?: number; // Custom font scale multiplier
  spacingScaleOverride?: number; // Custom spacing scale multiplier
  dimensionScaleOverride?: number; // Custom dimension scale multiplier

  // Disable responsive for specific properties
  disableProperties?: (keyof (ViewStyle & TextStyle & ImageStyle))[];

  // Debug
  debugMode?: boolean;
  debugLabel?: string;
}

// ===================================================================
// STYLE PROPERTY CATEGORIES
// ===================================================================

const FONT_PROPERTIES: (keyof (ViewStyle & TextStyle & ImageStyle))[] = [
  'fontSize',
  'lineHeight',
];

const SPACING_PROPERTIES: (keyof (ViewStyle & TextStyle & ImageStyle))[] = [
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'gap',
];

const DIMENSION_PROPERTIES: (keyof (ViewStyle & TextStyle & ImageStyle))[] = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
];

// ===================================================================
// RESPONSIVE WRAPPER COMPONENT
// ===================================================================

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  enableFontScaling = true,
  enableSpacingScaling = true,
  enableDimensionScaling = true,
  fontScaleOverride,
  spacingScaleOverride,
  dimensionScaleOverride,
  disableProperties = [],
  debugMode = false,
  debugLabel = 'ResponsiveWrapper',
}) => {
  // Process child element and apply responsive styles
  const processedChild = React.useMemo(() => {
    if (!React.isValidElement(children)) {
      return children;
    }

    const originalStyle = (children.props as { style?: unknown }).style;
    if (!originalStyle) {
      return children;
    }

    // Convert style to array for processing
    const styleArray = Array.isArray(originalStyle)
      ? originalStyle
      : [originalStyle];

    // Process each style object
    const processedStyles = styleArray.map((styleObj): unknown => {
      if (!styleObj || typeof styleObj !== 'object') {
        return styleObj as unknown;
      }

      const processedStyle = { ...(styleObj as Record<string, unknown>) };

      // Process each property in the style
      Object.keys(processedStyle).forEach(key => {
        const typedKey = key as keyof (ViewStyle & TextStyle & ImageStyle);
        const originalValue = (processedStyle as Record<string, unknown>)[
          typedKey
        ];

        // Skip if property is disabled
        if (disableProperties.includes(typedKey)) {
          return;
        }

        // Skip if value is not a number (can't scale strings, etc.)
        if (typeof originalValue !== 'number') {
          return;
        }

        let newValue = originalValue;

        // Font properties
        if (enableFontScaling && FONT_PROPERTIES.includes(typedKey)) {
          const migrated = migrateFontSize(originalValue);
          newValue = getResponsiveValue(migrated);

          if (fontScaleOverride) {
            newValue = Math.round(originalValue * fontScaleOverride);
          }
        }
        // Spacing properties
        else if (
          enableSpacingScaling &&
          SPACING_PROPERTIES.includes(typedKey)
        ) {
          const migrated = migrateSpacing(originalValue);
          newValue = getResponsiveValue(migrated);

          if (spacingScaleOverride) {
            newValue = Math.round(originalValue * spacingScaleOverride);
          }
        }
        // Dimension properties
        else if (
          enableDimensionScaling &&
          DIMENSION_PROPERTIES.includes(typedKey)
        ) {
          const migrated = migrateSpacing(originalValue); // Use spacing migration for dimensions too
          newValue = getResponsiveValue(migrated);

          if (dimensionScaleOverride) {
            newValue = Math.round(originalValue * dimensionScaleOverride);
          }
        }

        // Apply the new value
        if (newValue !== originalValue) {
          (processedStyle as Record<string, unknown>)[typedKey] = newValue;

          if (debugMode && __DEV__) {
            // eslint-disable-next-line no-console
            console.log(
              `📱 ${debugLabel}: ${typedKey} ${originalValue} → ${newValue}`
            );
          }
        }
      });

      return processedStyle as unknown;
    });

    // Return cloned element with processed styles
    return React.cloneElement(
      children as React.ReactElement<{ style?: unknown }>,
      {
        style:
          processedStyles.length === 1 ? processedStyles[0] : processedStyles,
      }
    );
  }, [
    children,
    enableFontScaling,
    enableSpacingScaling,
    enableDimensionScaling,
    fontScaleOverride,
    spacingScaleOverride,
    dimensionScaleOverride,
    disableProperties,
    debugMode,
    debugLabel,
  ]);

  return processedChild as React.ReactElement;
};

// ===================================================================
// SHORTCUT WRAPPERS FOR SPECIFIC USE CASES
// ===================================================================

export const ResponsiveFontWrapper: React.FC<{
  children: React.ReactElement;
  debugMode?: boolean;
}> = ({ children, debugMode = false }) => (
  <ResponsiveWrapper
    enableFontScaling={true}
    enableSpacingScaling={false}
    enableDimensionScaling={false}
    debugMode={debugMode}
    debugLabel="FontWrapper"
  >
    {children}
  </ResponsiveWrapper>
);

export const ResponsiveSpacingWrapper: React.FC<{
  children: React.ReactElement;
  debugMode?: boolean;
}> = ({ children, debugMode = false }) => (
  <ResponsiveWrapper
    enableFontScaling={false}
    enableSpacingScaling={true}
    enableDimensionScaling={false}
    debugMode={debugMode}
    debugLabel="SpacingWrapper"
  >
    {children}
  </ResponsiveWrapper>
);

export const ResponsiveDimensionWrapper: React.FC<{
  children: React.ReactElement;
  debugMode?: boolean;
}> = ({ children, debugMode = false }) => (
  <ResponsiveWrapper
    enableFontScaling={false}
    enableSpacingScaling={false}
    enableDimensionScaling={true}
    debugMode={debugMode}
    debugLabel="DimensionWrapper"
  >
    {children}
  </ResponsiveWrapper>
);

// ===================================================================
// HOC (Higher-Order Component) VERSION
// ===================================================================

export const withResponsive = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ResponsiveWrapperProps, 'children'> = {}
) => {
  const ResponsiveComponent: React.FC<P> = props => (
    <ResponsiveWrapper {...options}>
      <WrappedComponent {...props} />
    </ResponsiveWrapper>
  );

  ResponsiveComponent.displayName = `withResponsive(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return ResponsiveComponent;
};

// ===================================================================
// COMPATIBILITY ALIASES
// ===================================================================

export { ResponsiveWrapper as RWrapper };
export { ResponsiveFontWrapper as RFontWrapper };
export { ResponsiveSpacingWrapper as RSpacingWrapper };
export { ResponsiveDimensionWrapper as RDimensionWrapper };

export default ResponsiveWrapper;
