import React, { useCallback, useState, useMemo } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { ChiSiamoSection, ContactSection, StoriaModal } from '../components';
import { mainStyles } from '../styles';
import type { ChiSiamoScreenProps, ContactData } from '../types';

import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectContainer,
  PerfectIcon,
} from '@/components';
import { Colors, PerfectSpacing } from '@/shared/constants';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { isSuccess } from '@/shared/utils/result';
import { logWarn } from '@/shared/utils/logger';

const ChiSiamoScreen: React.FC<ChiSiamoScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();
  const insets = useSafeAreaInsets();
  const { openLink } = useLinkHandler({
    loadingDelay: 0, // ⚡ RIDUCO RITARDO A ZERO per velocità
    enableHaptics: false, // ⚡ DISABILITO HAPTICS DUPLICATI
    timeout: 5000, // ⚡ RIDUCO TIMEOUT
  });
  const [isStoriaModalVisible, setIsStoriaModalVisible] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  // Calcola top dinamico: safe area + spacing token
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        backButton: {
          ...mainStyles.backButton,
          top: insets.top + PerfectSpacing.base,
        },
        tabletContainer: {
          width: '70%',
          maxWidth: 640,
          alignSelf: 'center',
        },
      }),
    [insets.top]
  );

  const handleLocationPress = useCallback(async () => {
    const address = 'Via dei Fornaciai, 17, 40129 Bologna, BO, Italia';
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    const result = await openLink(url, 'maps', 'Impossibile aprire la mappa.');

    if (!isSuccess(result) && __DEV__) {
      logWarn('ChiSiamoScreen', 'Failed to open maps', result.error);
    }
  }, [openLink]);

  const handlePhonePress = useCallback(async () => {
    const result = await openLink(
      'tel:051704070',
      'phone',
      'Impossibile aprire il dialer.'
    );

    if (!isSuccess(result) && __DEV__) {
      logWarn('ChiSiamoScreen', 'Failed to open dialer', result.error);
    }
  }, [openLink]);

  const handleEmailPress = useCallback(async () => {
    const result = await openLink(
      'mailto:info@riseagainsthunger.it',
      'email',
      "Impossibile aprire l'app email."
    );

    if (!isSuccess(result) && __DEV__) {
      logWarn('ChiSiamoScreen', 'Failed to open email', result.error);
    }
  }, [openLink]);

  const handleShowStoria = useCallback(() => {
    setIsStoriaModalVisible(true);
  }, []);

  const handleCloseStoria = useCallback(() => {
    setIsStoriaModalVisible(false);
  }, []);

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  const contacts: ContactData[] = [
    {
      id: 'location',
      title: t('about.locationTitle'),
      subtitle: 'Via dei Fornaciai, 17 - Bologna',
      icon: 'map-marker',
      onPress: handleLocationPress,
    },
    {
      id: 'phone',
      title: t('about.phoneTitle'),
      subtitle: '051 704070',
      icon: 'phone',
      onPress: handlePhonePress,
    },
    {
      id: 'email',
      title: t('about.emailTitle'),
      subtitle: 'info@riseagainsthunger.it',
      icon: 'email',
      onPress: handleEmailPress,
    },
  ];

  return (
    <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
      {/* FRECCIA STACCATA */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={dynamicStyles.backButton}
      >
        <PerfectIcon name="arrow-left" size={24} color={Colors.neutral[900]} />
      </PlatformTouchable>

      <PlatformScrollView
        contentContainerStyle={[
          mainStyles.contentContainer,
          isTablet ? { paddingHorizontal: 0 } : {},
        ]}
      >
        <PerfectContainer style={isTablet ? dynamicStyles.tabletContainer : {}}>
          <ChiSiamoSection onInfoPress={handleShowStoria} />

          {/* Spazio tra sezioni (rimosso separatore visivo per evitare la riga che attraversa l'header) */}
          <PerfectContainer style={{ height: PerfectSpacing.lg }} />

          <ContactSection contacts={contacts} />
        </PerfectContainer>
      </PlatformScrollView>

      {/* Storia Modal */}
      <StoriaModal visible={isStoriaModalVisible} onClose={handleCloseStoria} />
    </SafeAreaView>
  );
};

export default ChiSiamoScreen;
