import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../shared/hooks/useLinkHandler';
import { isSuccess } from '../../shared/utils/result';
import { ChiSiamoSection, ContactSection, StoriaModal } from './components';
import { useChiSiamoAnimations } from './hooks/useChiSiamoAnimations';
import { mainStyles } from './styles';
import type { ChiSiamoScreenProps, ContactData } from './types';

const ChiSiamoScreen: React.FC<ChiSiamoScreenProps> = ({ navigation }) => {
  const { openLink } = useLinkHandler({
    loadingDelay: 0, // ⚡ RIDUCO RITARDO A ZERO per velocità
    enableHaptics: false, // ⚡ DISABILITO HAPTICS DUPLICATI
    timeout: 5000, // ⚡ RIDUCO TIMEOUT
  });
  const animations = useChiSiamoAnimations();
  const [isStoriaModalVisible, setIsStoriaModalVisible] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleLocationPress = useCallback(async () => {
    const address = 'Via dei Fornaciai, 17, 40129 Bologna, BO, Italia';
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    const result = await openLink(url, 'maps', 'Impossibile aprire la mappa.');

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open maps:', result.error);
    }
  }, [openLink]);

  const handlePhonePress = useCallback(async () => {
    const result = await openLink(
      'tel:051704070',
      'phone',
      'Impossibile aprire il dialer.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open dialer:', result.error);
    }
  }, [openLink]);

  const handleEmailPress = useCallback(async () => {
    const result = await openLink(
      'mailto:info@riseagainsthunger.it',
      'email',
      "Impossibile aprire l'app email."
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open email:', result.error);
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
      title: 'Sede',
      subtitle: 'Via dei Fornaciai, 17 - Bologna',
      icon: 'map-marker',
      onPress: handleLocationPress,
    },
    {
      id: 'phone',
      title: 'Telefono',
      subtitle: '051 704070',
      icon: 'phone',
      onPress: handlePhonePress,
    },
    {
      id: 'email',
      title: 'Email',
      subtitle: 'info@riseagainsthunger.it',
      icon: 'email',
      onPress: handleEmailPress,
    },
  ];

  return (
    <SafeAreaView style={mainStyles.container}>
      {/* FRECCIA STACCATA */}
      <TouchableOpacity onPress={handleBackPress} style={mainStyles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mainStyles.contentContainer}
      >
        <ChiSiamoSection
          animations={animations}
          onInfoPress={handleShowStoria}
        />

        {/* SEPARATORE TRA SEZIONI - IDENTICO ALLA PAGINA AZIONI */}
        <View style={mainStyles.sectionDividerContainer}>
          <View style={mainStyles.sectionDivider} />
        </View>

        <ContactSection animations={animations} contacts={contacts} />
      </ScrollView>

      {/* Storia Modal */}
      <StoriaModal visible={isStoriaModalVisible} onClose={handleCloseStoria} />
    </SafeAreaView>
  );
};

export default ChiSiamoScreen;
