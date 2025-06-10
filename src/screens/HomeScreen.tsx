import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

// Components Premium - Versione Modernizzata
import { HomeHeaderSection } from '../components/HomeHeaderSection';
import ModernHomeActions from '../components/ModernHomeActions';
import ModernHomeImpact from '../components/ModernHomeImpact';

// Hooks & Utils
import { Spacing } from '../constants/designTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useHomeScrollAnimation } from '../hooks/useHomeScrollAnimation';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
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
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Navigation handlers with haptic feedback
  const handleShopPress = () => {
    triggerHaptic('medium');
    navigation.navigate('CharityShop', {
      title: 'Shop Solidale',
      subtitle: 'Acquista con impatto',
    });
  };

  const handleGiftCardPress = () => {
    triggerHaptic('medium');
    navigation.navigate('CharityGiftCard', {
      title: 'Gift Card',
      subtitle: 'Regala solidarietà',
    });
  };

  const handleEventsPress = () => {
    triggerHaptic('medium');
    navigation.navigate('Calendario', {
      title: 'Eventi',
      subtitle: 'Unisciti alle nostre iniziative',
    });
  };

  const handleProjectsPress = () => {
    triggerHaptic('medium');
    navigation.navigate('Progetti');
  };

  const handleImpactPress = () => {
    triggerHaptic('medium');
    navigation.navigate('Impatto2024');
  };

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
        accessible={true}
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
