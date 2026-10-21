import React, { useContext, useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '../types/HomeScreenTypes';
import { EntraInAzione } from '../components/EntraInAzione';

import { HomeHeaderSection } from '../components/HomeHeaderSection';
import { PerfectContainer } from '@components/ui';
import { useThemeColors } from '@shared/hooks/useThemeColors';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useDeviceType } from '@shared/hooks/useDeviceType';
import { PerfectSpacing } from '@shared/constants';

const HomeScreenComponent: React.FC<HomeScreenProps> = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isTablet } = useDeviceType();
  const scrollY = useRef(new Animated.Value(0)).current;

  // La barra delle schede è flottante e pubblica la sua altezza vera (scala del testo e bordo
  // sicuro compresi): il fondo dei contenuti ne resta fuori. Fuori dal navigatore (test) vale 0.
  const bottomPadding =
    (useContext(BottomTabBarHeightContext) ?? 0) + PerfectSpacing.lg;

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
        tabletContainer: {
          width: '70%',
          maxWidth: 640, // CAP per Landscape: evita che il 70% diventi troppo largo su schermi wide
          alignSelf: 'center',
        },
      }),
    [colors, bottomPadding]
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right']}
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
          style={isTablet ? styles.tabletContainer : {}}
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
