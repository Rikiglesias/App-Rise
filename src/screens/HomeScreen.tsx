import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

// Components Premium - Versione Modernizzata
import { HomeHeaderSection } from '../components/domain/HomeHeaderSection';
import ModernHomeActions from '../components/domain/ModernHomeActions';
import ModernHomeImpact from '../components/domain/ModernHomeImpact';
// Hooks & Utils
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useHomeScrollAnimation } from '../hooks/useHomeScrollAnimation';
import type { RootStackParamList } from '../navigation/types';
import { Spacing } from '../shared/constants/designTokens';
import { useTheme } from '../shared/hooks/useTheme';
import { isSuccess, safeAsync } from '../utils/result';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  readonly navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHapticFeedback();

  // Enhanced scroll animation hook
  const { scrollY, handleScroll } = useHomeScrollAnimation();

  // Loading states for progressive enhancement
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate component mount completion
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Helper per haptic feedback sicuro (non-blocking)
  const safeHapticFeedback = useCallback(
    async (feedbackType: Parameters<typeof triggerHaptic>[0]) => {
      const result = await safeAsync(() => triggerHaptic(feedbackType));

      if (!isSuccess(result) && __DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[HomeScreen] Haptic feedback failed:', result.error);
      }
    },
    [triggerHaptic]
  );

  // Navigation handlers with safe haptic feedback
  const handleShopPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('CharityShop', {
      title: 'Shop Solidale',
      subtitle: 'Acquista con impatto',
    });
  }, [safeHapticFeedback, navigation]);

  const handleGiftCardPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('CharityGiftCard', {
      title: 'Gift Card',
      subtitle: 'Regala solidarietà',
    });
  }, [safeHapticFeedback, navigation]);

  const handleEventsPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('Calendario', {
      title: 'Eventi',
      subtitle: 'Unisciti alle nostre iniziative',
    });
  }, [safeHapticFeedback, navigation]);

  const handleProjectsPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('Progetti');
  }, [safeHapticFeedback, navigation]);

  const handleImpactPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('Impatto2024');
  }, [safeHapticFeedback, navigation]);

  const handleSocialPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('Seguici');
  }, [safeHapticFeedback, navigation]);

  const handleChiSiamoPress = useCallback(async () => {
    await safeHapticFeedback('medium');
    navigation.navigate('ChiSiamo');
  }, [safeHapticFeedback, navigation]);

  // Modern minimalist styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },

    scrollView: {
      flex: 1,
    },

    content: {
      flex: 1,
      paddingBottom: Spacing[8],
    },

    // Hero section with breathing space
    heroSection: {
      paddingBottom: Spacing[4],
    },

    // Main content with sophisticated spacing
    mainContent: {
      paddingHorizontal: Spacing[4],
      gap: Spacing[6],
    },

    // Actions section with modern layout
    actionsSection: {
      marginTop: Spacing[2],
    },

    // Impact section with emphasis
    impactSection: {
      marginTop: Spacing[4],
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessible
        accessibilityLabel="Schermata principale Rise Against Hunger Italia"
      >
        <View style={styles.content}>
          {/* 🎨 MODERN HERO SECTION */}
          <View style={styles.heroSection}>
            <HomeHeaderSection scrollY={scrollY} />
          </View>

          {/* 📦 MAIN CONTENT CONTAINER */}
          <View style={styles.mainContent}>
            {/* 🚀 MODERN ACTIONS GRID */}
            <View style={styles.actionsSection}>
              <ModernHomeActions
                onShopPress={handleShopPress}
                onGiftCardPress={handleGiftCardPress}
                onEventsPress={handleEventsPress}
                onProjectsPress={handleProjectsPress}
                onSocialPress={handleSocialPress}
                onChiSiamoPress={handleChiSiamoPress}
                isLoaded={isLoaded}
              />
            </View>

            {/* 📊 MODERN IMPACT SECTION */}
            <View style={styles.impactSection}>
              <ModernHomeImpact
                onImpactPress={handleImpactPress}
                isLoaded={isLoaded}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
