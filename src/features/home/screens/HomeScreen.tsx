import React, { useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Animated } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { HomeScreenProps } from '../types/HomeScreenTypes';
import { EntraInAzione } from '../components/EntraInAzione';

import { HomeHeaderSection } from '../components/HomeHeaderSection';
import {
  PerfectContainer,
  PlatformTouchable,
  PerfectIcon,
} from '@components/ui';
import { useThemeColors } from '@shared/hooks/useThemeColors';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useDeviceType } from '@shared/hooks/useDeviceType';
import { PerfectSpacing } from '@shared/constants';
import { Colors, BorderRadius } from '@shared/constants/designTokens';
import { scale } from '@shared/constants/perfectScale';
import type { RootStackNavigationProp } from '@/navigation/types';

const HomeScreenComponent: React.FC<HomeScreenProps> = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isTablet } = useDeviceType();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const basePadding = PerfectSpacing.lg;
  const navHeight = scale(80);
  const bottomPadding = basePadding + navHeight + insets.bottom;

  const goToProfile = useCallback(
    (): void => navigation.navigate('Profilo'),
    [navigation]
  );

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
        // Avatar accesso Area Donatori: overlay fisso in alto a destra (fuori
        // dallo ScrollView, così non scrolla). Sostituisce il vecchio tab Profilo.
        profileButton: {
          position: 'absolute',
          top: insets.top + PerfectSpacing.sm,
          right: PerfectSpacing.lg,
          zIndex: 10,
          width: scale(40),
          height: scale(40),
          borderRadius: BorderRadius.full,
          backgroundColor: colors.neutral[100],
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: scale(1),
          borderColor: colors.neutral[200],
        },
      }),
    [colors, bottomPadding, insets.top]
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
      accessibilityLabel={t('home.screenLabel')}
      testID="home-screen"
    >
      {/* Accesso all'Area Donatori: avatar fisso in alto a destra (al posto del
          vecchio tab Profilo nella bottom bar). */}
      <PlatformTouchable
        onPress={goToProfile}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('navigation.profile')}
        style={styles.profileButton}
      >
        <PerfectIcon name="account" size={22} color={Colors.primary[600]} />
      </PlatformTouchable>

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
