import React, { useCallback, useMemo } from 'react';

import type { ChiSiamoSectionProps } from '../types';
import {
  CHI_SIAMO_INFO_SIZE,
  createChiSiamoSectionStyles,
} from '../styles/chiSiamoStyles';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { touchTargetHitSlop } from '@/shared/utils/minimumTouchTarget';

export const ChiSiamoSection: React.FC<ChiSiamoSectionProps> = ({
  onInfoPress,
}) => {
  const { t } = useTranslation();
  const { triggerHaptic } = useHapticFeedback();
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const chiSiamoSectionStyles = useMemo(
    () => createChiSiamoSectionStyles(colors),
    [colors]
  );

  const handleInfoPress = useCallback(() => {
    void triggerHaptic('light');
    onInfoPress();
  }, [onInfoPress, triggerHaptic]);

  return (
    <PerfectContainer style={chiSiamoSectionStyles.categoryContainer}>
      {/* HEADER CON TITOLO CLICCABILE */}
      <PerfectContainer
        style={[
          chiSiamoSectionStyles.headerContainer,
          isTablet ? { paddingHorizontal: 0 } : {},
        ]}
      >
        <PerfectContainer
          paddingVertical={PerfectSpacing.md}
          paddingHorizontal={PerfectSpacing.lg}
          style={chiSiamoSectionStyles.titleHeaderContainer}
        >
          {/* TITOLO E SOTTOTITOLO */}
          <PlatformTouchable
            onPress={handleInfoPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.organizationStory')}
            style={chiSiamoSectionStyles.titleClickableContainer}
          >
            <PerfectText
              size={30}
              lines={1}
              fontWeight="700"
              style={chiSiamoSectionStyles.categoryTitle}
            >
              {t('about.title')}
            </PerfectText>
            <PerfectText
              size={15}
              lines={2}
              fontWeight="500"
              style={chiSiamoSectionStyles.descriptionText}
            >
              {t('about.description')}
            </PerfectText>
          </PlatformTouchable>
          <PlatformTouchable
            onPress={handleInfoPress}
            accessibilityRole="button"
            accessibilityLabel={t('about.accessibilityLabel')}
            style={chiSiamoSectionStyles.infoIconImproved}
            hitSlop={touchTargetHitSlop(CHI_SIAMO_INFO_SIZE)}
          >
            <PerfectIcon
              name="information"
              size={24}
              color={colors.neutral[900]}
            />
          </PlatformTouchable>
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};
