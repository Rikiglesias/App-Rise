import React, { useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useHomeAnimations } from '../hooks/useHomeAnimations';
import type { HomeScreenProps } from '../types/HomeScreenTypes';

import { EntraInAzione } from '../components/EntraInAzione';

import { PlatformScrollView, PerfectContainer } from '@components/ui';
import { HomeHeaderSection } from '@components/domain/HomeHeaderSection';
import { useTheme } from '@shared/hooks/useTheme';
import { Spacing } from '@shared/constants';

const HomeScreenComponent: React.FC<HomeScreenProps> = ({
  navigation: _navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {
    titleAnim: _titleAnim,
    imageAnim: _imageAnim,
    containerAnim: _containerAnim,
  } = useHomeAnimations();

  const basePadding = Spacing[6];
  const navHeight = 80; // Navigation bar height
  const bottomPadding = basePadding + navHeight + insets.bottom;

  // Temporarily disabled scroll animations to fix onScroll error
  // const scrollInterpolations = useScrollInterpolations(scrollY);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.neutral[0],
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView
        contentContainerStyle={{
          paddingBottom: bottomPadding,
        }}
      >
        <PerfectContainer preset="page" paddingVertical={0}>
          {/* Header Section con titolo e logo - SPAZIO BILANCIATO */}
          <PerfectContainer
            preset="section"
            paddingVertical={Spacing[3]}
          >
            <HomeHeaderSection scrollY={scrollY} />

            {/* Hero Image rimossa - già inclusa in HomeHeaderSection */}
          </PerfectContainer>

          {/* Sezione Entra in Azione con CTA */}
          <PerfectContainer
            preset="section"
            marginHorizontal={Spacing[2]}
            paddingVertical={Spacing[4]} // ← RIDOTTO DA 6 A 4 per più spazio visibile
          >
            <EntraInAzione />
          </PerfectContainer>
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const HomeScreen = React.memo(HomeScreenComponent);

export default HomeScreen;
