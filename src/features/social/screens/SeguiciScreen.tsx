import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { SocialCard, HeaderSection } from '../components';
import { useSocialPlatforms } from '../hooks/useSocialPlatforms';
import { mainStyles } from '../styles/mainStyles';
import { mainStyles as aboutMainStyles } from '../../about/styles/mainStyles';

import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { Colors, PerfectSpacing } from '@/shared/constants';
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
  const { triggerHaptic } = useHapticFeedback();
  const { socialPlatforms } = useSocialPlatforms();

  // Calcola top dinamico: safe area + spacing token
  const dynamicBackButtonStyle = useMemo(
    () =>
      StyleSheet.create({
        backButton: {
          ...aboutMainStyles.backButton,
          top: insets.top + PerfectSpacing.base,
        },
      }),
    [insets.top]
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
        style={dynamicBackButtonStyle.backButton}
      >
        <PerfectIcon name="arrow-left" size={24} color={Colors.neutral[900]} />
      </PlatformTouchable>

      <PlatformScrollView contentContainerStyle={mainStyles.contentContainer}>
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
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export default SeguiciScreen;
