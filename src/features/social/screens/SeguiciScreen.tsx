import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { SafeAreaView, View } from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../../../components/ui';

import type { RootStackParamList } from '../../../navigation/types';
import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';

// Componenti modulari
import { SocialCard } from '../components/SocialCard';
import { HeaderSection } from '../components/HeaderSection';
import { useSocialPlatforms } from '../hooks/useSocialPlatforms';
import { mainStyles } from '../styles/mainStyles';

type SeguiciScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Seguici'
>;

interface Props {
  readonly navigation: SeguiciScreenNavigationProp;
}

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const { triggerHaptic } = useHapticFeedback();

  // Hook personalizzato per gestire social platforms e animazioni
  const { socialPlatforms, animationValue } = useSocialPlatforms();

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  return (
    <SafeAreaView style={mainStyles.container}>
      {/* FRECCIA STACCATA - IDENTICA A CHI SIAMO */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={mainStyles.backButton}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </PlatformTouchable>

      <PlatformScrollView contentContainerStyle={mainStyles.contentContainer}>
        {/* Header Section Modulare */}
        <HeaderSection animationValue={animationValue} />

        {/* SEPARATORE TRA SEZIONI - IDENTICO ALLA PAGINA CHI SIAMO */}
        <View style={mainStyles.sectionDividerContainer}>
          <View style={mainStyles.sectionDivider} />
        </View>

        {/* Social Platforms Section */}
        <View style={mainStyles.socialSection}>
          {socialPlatforms.map((platform, _index) => (
            <SocialCard
              key={platform.id}
              platform={platform}
              animationValue={animationValue}
            />
          ))}
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export default SeguiciScreen;
