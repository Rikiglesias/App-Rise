import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectText,
} from '../../../components/ui';

import type { RootStackParamList } from '../../../navigation/types';
import { BorderRadius, Colors, Spacing } from '../../../shared/constants';
import { scaleFont } from '../../../shared/constants/responsiveSystem';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';
import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';

// Componenti modulari
import { SocialCard } from '../components/SocialCard';
import { HeaderSection } from '../components/HeaderSection';
import { useSocialPlatforms } from '../hooks/useSocialPlatforms';

type SeguiciScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Seguici'
>;

interface Props {
  readonly navigation: SeguiciScreenNavigationProp;
}

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const { triggerHaptic } = useHapticFeedback();
  const insets = useSafeAreaInsets();

  // Hook personalizzato per gestire social platforms e animazioni
  const { socialPlatforms, animationValue } = useSocialPlatforms();

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  // Componente renderizzato tramite SocialCard modulare

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={[styles.backButton, { top: insets.top + Spacing[2] }]}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </PlatformTouchable>

      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section Modulare */}
        <HeaderSection animationValue={animationValue} />

        {/* Separatore */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
          <View style={styles.dividerEmojiContainer}>
            <PerfectText size={16} lines={1} style={styles.dividerEmoji}>
              📱
            </PerfectText>
          </View>
        </View>

        {/* Social Platforms Section */}
        <View style={styles.socialSection}>
          {socialPlatforms.map((platform, _index) => (
            <SocialCard
              key={platform.id}
              platform={platform}
              animationValue={animationValue}
            />
          ))}
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    position: 'absolute' as const,
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    ...PlatformShadows.lg,
    zIndex: 20,
  },
  scrollContent: {
    paddingTop: Spacing[20],
    paddingHorizontal: Spacing[4],
    paddingBottom: Platform.OS === 'android' ? Spacing[24] : Spacing[8],
  },
  socialSection: {
    marginTop: Spacing[6],
    marginBottom: Spacing[1],
    gap: Spacing[4],
    paddingHorizontal: 0,
  },
  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
  },
  sectionDivider: {
    height: scaleFont(2),
    backgroundColor: Colors.neutral[300],
    width: scaleFont(236), // 393 * 0.6 = 235.8, rounded to 236
    borderRadius: scaleFont(1),
    opacity: 0.8,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute' as const,
  },
  dividerEmojiContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  dividerEmoji: {
    textAlign: 'center' as const,
  },
});

export default SeguiciScreen;
