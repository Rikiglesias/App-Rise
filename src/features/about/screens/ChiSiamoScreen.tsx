import React, { useCallback, useState, useMemo } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { ChiSiamoSection, ContactSection, StoriaModal } from '../components';
import { createMainStyles } from '../styles';
import type { ChiSiamoScreenProps, ContactData } from '../types';

import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectContainer,
  PerfectIcon,
} from '@/components';
import { PerfectSpacing } from '@/shared/constants';
import { RISE_CONTACTS } from '@/shared/constants/urls';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
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
  const colors = useThemeColors();
  const mainStyles = useMemo(() => createMainStyles(colors), [colors]);

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
    [insets.top, mainStyles]
  );

  const handleLocationPress = useCallback(async () => {
    const address = RISE_CONTACTS.address;
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    const result = await openLink(
      url,
      'maps',
      t('links.errors.map', { address })
    );

    if (!isSuccess(result) && __DEV__) {
      logWarn('Failed to open maps', 'ChiSiamoScreen', result.error);
    }
  }, [openLink, t]);

  const handlePhonePress = useCallback(async () => {
    const result = await openLink(
      `tel:${RISE_CONTACTS.phone}`,
      'phone',
      t('links.errors.phone', { phone: RISE_CONTACTS.phoneDisplay })
    );

    if (!isSuccess(result) && __DEV__) {
      logWarn('Failed to open dialer', 'ChiSiamoScreen', result.error);
    }
  }, [openLink, t]);

  const handleEmailPress = useCallback(async () => {
    const result = await openLink(
      `mailto:${RISE_CONTACTS.email}`,
      'email',
      t('links.errors.email', { email: RISE_CONTACTS.email })
    );

    if (!isSuccess(result) && __DEV__) {
      logWarn('Failed to open email', 'ChiSiamoScreen', result.error);
    }
  }, [openLink, t]);

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
      subtitle: RISE_CONTACTS.addressDisplay,
      icon: 'map-marker',
      onPress: handleLocationPress,
    },
    {
      id: 'phone',
      title: t('about.phoneTitle'),
      subtitle: RISE_CONTACTS.phoneDisplay,
      icon: 'phone',
      onPress: handlePhonePress,
    },
    {
      id: 'email',
      title: t('about.emailTitle'),
      subtitle: RISE_CONTACTS.email,
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
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <PerfectIcon name="arrow-left" size={24} color={colors.neutral[900]} />
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
