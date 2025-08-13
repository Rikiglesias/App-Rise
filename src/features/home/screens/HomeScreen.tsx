import React, { useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformScrollView } from '../../../components/ui';
import { EntraInAzione } from '../components';
import { useHomeAnimations } from '../hooks';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Spacing } from '../../../shared/constants/designTokens';
import { HomeHeaderSection } from '../../../components/domain/HomeHeaderSection';
import type { HomeScreenProps } from '../types';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {
    titleAnim: _titleAnim,
    imageAnim: _imageAnim,
    containerAnim: _containerAnim,
  } = useHomeAnimations();

  // Temporarily disabled scroll animations to fix onScroll error
  // const scrollInterpolations = useScrollInterpolations(scrollY);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[0],
    },
    content: {
      flexGrow: 1,
      paddingBottom: Spacing[20],
    },
    heroSection: {
      marginBottom: Spacing[3],
    },
    ctaSection: {
      marginHorizontal: Spacing[4],
      paddingTop: 0,
      paddingBottom: Spacing[6],
      marginTop: 0,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView>
        <View style={styles.content}>
          {/* Header Section con titolo e logo */}
          <View style={styles.heroSection}>
            <HomeHeaderSection scrollY={scrollY} />

            {/* Hero Image rimossa - già inclusa in HomeHeaderSection */}
          </View>

          {/* Sezione Entra in Azione con CTA */}
          <View style={styles.ctaSection}>
            <EntraInAzione navigation={navigation} />
          </View>
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
