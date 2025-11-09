import React, { useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type { HomeScreenProps } from '../types/HomeScreenTypes';
import { EntraInAzione } from '../components/EntraInAzione';

import { HomeHeaderSection } from '../components/HomeHeaderSection';
import { PerfectContainer } from '@components/ui';
import { useTheme } from '@shared/hooks/useTheme';
import { useTranslation } from '@shared/hooks/useTranslation';
import { PerfectSpacing } from '@shared/constants';
import { scale } from '@shared/constants/perfectScale';

const HomeScreenComponent: React.FC<HomeScreenProps> = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const basePadding = PerfectSpacing.lg;
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
      accessibilityLabel={t('home.screenLabel')}
      testID="home-screen"
    >
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <PerfectContainer
          preset="page"
          paddingVertical={0}
          paddingHorizontal={0}
        >
          {/* Header Section con titolo e logo - FULL WIDTH */}
          <PerfectContainer paddingVertical={PerfectSpacing.sm}>
            <HomeHeaderSection scrollY={scrollY} />
          </PerfectContainer>

          {/* Sezione Entra in Azione con CTA */}
          <EntraInAzione />
        </PerfectContainer>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const HomeScreen = React.memo(HomeScreenComponent);

export default HomeScreen;
