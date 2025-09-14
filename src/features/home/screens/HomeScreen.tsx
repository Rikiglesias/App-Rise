import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHomeAnimations } from '../hooks/useHomeAnimations';
import type { HomeScreenProps } from '../types/HomeScreenTypes';

import { EntraInAzione } from '../components/EntraInAzione';

import { PlatformScrollView } from '@components/ui';
import { HomeHeaderSection } from '@components/domain/HomeHeaderSection';
import { useTheme } from '@shared/hooks/useTheme';
import { Spacing } from '@shared/constants/designTokens';

const HomeScreenComponent: React.FC<HomeScreenProps> = ({
  navigation: _navigation,
}) => {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {
    titleAnim: _titleAnim,
    imageAnim: _imageAnim,
    containerAnim: _containerAnim,
  } = useHomeAnimations();

  // Temporarily disabled scroll animations to fix onScroll error
  // const scrollInterpolations = useScrollInterpolations(scrollY);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          marginHorizontal: Spacing[2], // Allargato il container più esterno
          paddingTop: 0,
          paddingBottom: Spacing[6],
          marginTop: 0,
        },
      }),
    [colors]
  );

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
            <EntraInAzione />
          </View>
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const HomeScreen = React.memo(HomeScreenComponent);

export default HomeScreen;
