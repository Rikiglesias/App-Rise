import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { TAB_LABEL_SIZE } from './tabBarLayout';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import {
  BorderRadius,
  Colors,
  Typography,
} from '@/shared/constants/designTokens';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { minimumTouchTarget } from '@/shared/utils/minimumTouchTarget';

interface TabBarButtonProps {
  isFocused: boolean;
  isCentral: boolean;
  options: {
    tabBarAccessibilityLabel?: string;
  };
  onPress: () => void;
  onLongPress: () => void;
  routeName: string;
}

const ICON_MAP: Record<string, string> = {
  ImpactTab: 'chart-line',
  HomeTab: 'home',
  InfoTab: 'hand-heart',
};

const TabBarButtonComponent: React.FC<TabBarButtonProps> = ({
  isFocused,
  isCentral,
  options,
  onPress,
  onLongPress,
  routeName,
}) => {
  const colors = useThemeColors();
  const tabColors = useMemo(() => {
    switch (routeName) {
      case 'ImpactTab':
        return {
          backgroundColor: colors.primary[500],
          shadowColor: colors.primary[500],
          iconColor: Colors.accent.white, // icona bianca fissa su cerchio brand
          labelColor: colors.primary[500],
        };
      case 'InfoTab':
        return {
          backgroundColor: colors.semantic.success.main,
          shadowColor: colors.semantic.success.main,
          iconColor: Colors.accent.white, // icona bianca fissa su cerchio brand
          labelColor: colors.semantic.success.main,
        };
      case 'HomeTab':
      default:
        return {
          backgroundColor: isFocused ? colors.neutral[500] : colors.neutral[0],
          shadowColor: colors.neutral[500],
          iconColor: isFocused ? Colors.accent.white : colors.neutral[700],
          labelColor: colors.neutral[500],
        };
    }
  }, [routeName, isFocused, colors]);

  const iconName = useMemo(() => ICON_MAP[routeName] ?? 'circle', [routeName]);
  // A ogni disegno: `scale()` legge la finestra di adesso (C54).
  const iconSize = isCentral ? scale(32) : scale(26);

  return (
    <PerfectContainer style={styles.buttonContainer}>
      <PlatformTouchable
        activeOpacity={0.7}
        rippleColor="transparent"
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.touchable}
      >
        <PerfectContainer style={styles.touchableContent}>
          <PerfectContainer
            style={[
              isCentral ? styles.centralIconContainer : styles.iconContainer,
              {
                backgroundColor: tabColors.backgroundColor,
                shadowColor: tabColors.shadowColor,
              },
            ]}
          >
            <PerfectIcon
              name={iconName}
              size={iconSize}
              color={tabColors.iconColor}
            />
          </PerfectContainer>
          <PerfectContainer>
            {/* Una riga che cresce con la scala di sistema e si restringe solo se la parola non entra */}
            <PerfectText
              size={TAB_LABEL_SIZE}
              lines={1}
              variant="fit"
              color={tabColors.labelColor}
              style={styles.labelText}
            >
              {options.tabBarAccessibilityLabel?.split(' ')[0] ?? 'Tab'}
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>
      </PlatformTouchable>
    </PerfectContainer>
  );
};

export const TabBarButton = React.memo(TabBarButtonComponent);

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    minHeight: scale(80),
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: PerfectSpacing.sm,
    width: '100%',
    ...minimumTouchTarget(scale(80)),
  },
  touchableContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // --- Icon ---
  iconContainer: {
    width: scale(52),
    height: scale(52),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...getPerfectShadow('medium'),
    elevation: scale(8),
  },
  centralIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: Colors.neutral[0],
    ...getPerfectShadow('strong'),
    elevation: scale(12),
  },
  // --- Label ---
  labelText: {
    fontWeight: Typography.weights.semibold,
    marginTop: PerfectSpacing.xs,
    textAlign: 'center',
  },
});
