import React, { useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type { HomeScreenProps } from '../types/HomeScreenTypes';
import { EntraInAzione } from '../components/EntraInAzione';

import { PlatformScrollView, PerfectContainer } from '@components/ui';
import { HomeHeaderSection } from '@components/domain/HomeHeaderSection';
import { useTheme } from '@shared/hooks/useTheme';
import { Spacing } from '@shared/constants';
import { scale } from '@shared/constants/perfectScale';

const HomeScreenComponent: React.FC<HomeScreenProps> = ({
  navigation: _navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const basePadding = Spacing[6];
  const navHeight = scale(80);
  const bottomPadding = basePadding + navHeight + insets.bottom;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.neutral[0],
        },
        scrollContent: {
          paddingBottom: bottomPadding,
        },
      }),
    [colors, bottomPadding]
  );

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['top', 'bottom']}
      accessibilityLabel="Schermata Home"
      testID="home-screen"
    >
      <PlatformScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <PerfectContainer preset="page" paddingVertical={0}>
          {/* Header Section con titolo e logo - SPAZIO BILANCIATO */}
          <PerfectContainer preset="section" paddingVertical={Spacing[3]}>
            <HomeHeaderSection scrollY={scrollY} />
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
