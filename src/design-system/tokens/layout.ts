// ===================================================================
// ?? DESIGN TOKENS - LAYOUT
// ===================================================================

import { Layout as BaseLayout } from '../../shared/constants';
import {
  DeviceBreakpoints,
  DesignTokens,
  scaleSize,
} from '../../shared/constants/responsiveSystem';

const containerSizes = DesignTokens.containers.textBlock;
const componentTokens = DesignTokens.components;
const buttonHeights = componentTokens.buttonHeight;
const touchTargets = componentTokens.touchTarget;
const iconSizes = componentTokens.iconSize;

const breakpointValues = {
  xs: DeviceBreakpoints.compact.maxWidth,
  sm: DeviceBreakpoints.standard.maxWidth,
  md: DeviceBreakpoints.large.maxWidth,
  lg: DeviceBreakpoints.xlarge.maxWidth,
  xl: DeviceBreakpoints.xxlarge.minWidth,
  '2xl': DeviceBreakpoints.xxlarge.minWidth + 200,
};

export const DesignLayout = {
  ...BaseLayout,
  breakpoints: {
    ...breakpointValues,
    device: DeviceBreakpoints,
  },
  container: {
    xs: '100%',
    sm: containerSizes.maxPhone,
    md: containerSizes.maxTablet,
    lg: containerSizes.maxDesktop,
    xl: containerSizes.maxDesktop,
    '2xl': containerSizes.maxDesktop,
  },
  component: {
    button: {
      height: {
        sm: buttonHeights.compact,
        md: buttonHeights.standard,
        lg: buttonHeights.large,
      },
      minWidth: {
        sm: touchTargets.minimum,
        md: touchTargets.comfortable,
        lg: touchTargets.generous,
      },
    },
    input: {
      height: {
        sm: buttonHeights.compact,
        md: buttonHeights.standard,
        lg: buttonHeights.large,
      },
    },
    card: {
      minHeight: scaleSize(120),
      maxWidth: containerSizes.maxPhone,
    },
    modal: {
      minWidth: scaleSize(320),
      maxWidth: containerSizes.maxTablet,
      minHeight: scaleSize(200),
    },
  },
  spacing: {
    sectionSpacing: 24,
    screenPadding: 16,
    cardSpacing: 12,
    component: DesignTokens.layout.dividerSpacing,
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
  icon: {
    xs: scaleSize(12),
    sm: iconSizes.small,
    md: iconSizes.medium,
    lg: iconSizes.large,
    xl: iconSizes.xlarge,
    '2xl': scaleSize(56),
  },
};

export const Layout = DesignLayout;

export default DesignLayout;
