import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { SocialCard, HeaderSection } from '../components';
import { useSocialPlatforms } from '../useSocialPlatforms';
import { createMainStyles } from '../mainStyles';
import { createMainStyles as createAboutMainStyles } from '../../about/styles/mainStyles';

import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { RootStackParamList } from '@/navigation/types';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

type SeguiciScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Seguici'
>;

interface Props {
  readonly navigation: SeguiciScreenNavigationProp;
}

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isTablet } = useDeviceType();
  const { triggerHaptic } = useHapticFeedback();
  const { socialPlatforms } = useSocialPlatforms();
  const colors = useThemeColors();
  const mainStyles = useMemo(() => createMainStyles(colors), [colors]);
  const aboutMainStyles = useMemo(
    () => createAboutMainStyles(colors),
    [colors]
  );

  // Calcola top dinamico: safe area + spacing token
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        backButton: {
          ...aboutMainStyles.backButton,
          top: insets.top + PerfectSpacing.base,
        },
        tabletContainer: {
          width: '70%',
          maxWidth: 640,
          alignSelf: 'center',
        },
      }),
    [insets.top, aboutMainStyles]
  );

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  return (
    <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
      {/* FRECCIA STACCATA - IDENTICA A CHI SIAMO */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={dynamicStyles.backButton}
      >
        <PerfectIcon name="arrow-left" size={24} color={colors.neutral[900]} />
      </PlatformTouchable>

      <PlatformScrollView
        contentContainerStyle={[
          mainStyles.contentContainer,
          isTablet ? { paddingHorizontal: 0 } : {},
        ]}
      >
        <PerfectContainer style={isTablet ? dynamicStyles.tabletContainer : {}}>
          <HeaderSection />

          {/* SEPARATORE TRA SEZIONI - IDENTICO ALLA PAGINA CHI SIAMO */}
          <PerfectContainer style={mainStyles.sectionDividerContainer}>
            <PerfectContainer style={mainStyles.sectionDivider} />
          </PerfectContainer>

          {/* Social Platforms Section */}
          <PerfectContainer style={mainStyles.socialSection}>
            {socialPlatforms.map((platform, _index) => (
              <SocialCard key={platform.id} platform={platform} />
            ))}
          </PerfectContainer>
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export default SeguiciScreen;
