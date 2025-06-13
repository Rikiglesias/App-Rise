/* eslint-disable react-native/no-unused-styles */
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { DonationInfoModal } from '../components/layout/DonationInfoModal';
import { ProfessionalSectionsRenderer } from '../components/domain/ProfessionalSectionsRenderer';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useProfessionalAnimations } from '../hooks/useProfessionalAnimations';
import { useTheme } from '../shared/hooks/useTheme';
import {
  useProfessionalLayoutStyles,
  useProfessionalUtilityStyles,
} from '../styles/ContributeScreenStyles';
import type {
  CategorySection,
  ContributeTabScreenProps,
  InfoAction,
} from '../types/ContributeScreenTypes';

export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { colors } = useTheme();
  const animations = useProfessionalAnimations();
  const layoutStyles = useProfessionalLayoutStyles();
  const utilityStyles = useProfessionalUtilityStyles();

  // State per gestire il popup elegante
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 🎛️ PROFESSIONAL SECTIONS DATA
  const professionalSections: CategorySection[] = [
    {
      id: 'azione',
      title: 'Dona Ora',
      subtitle:
        'Partecipa attivamente alla nostra missione di solidarietà globale',
      icon: '●',
      color: colors.primary[600],
      gradient: [colors.primary[500], colors.primary[700]] as [string, string],
      actions: [
        {
          id: 'projects',
          title: 'Progetti',
          subtitle: 'Scopri i nostri progetti attivi',
          icon: '🌍',
          category: 'azione',
          priority: 'alta',
          onPress: () => navigation.navigate('Progetti'),
        },
        {
          id: 'shop',
          title: 'Charity Shop',
          subtitle: 'Acquista prodotti solidali',
          icon: '🛍️',
          category: 'azione',
          priority: 'alta',
          onPress: () =>
            navigation.navigate('CharityShop', {
              title: 'Shop Solidale',
              subtitle: 'Acquista con impatto',
            }),
        },
        {
          id: 'giftcard',
          title: 'Gift Card',
          subtitle: 'Regala solidarietà',
          icon: '🎁',
          category: 'azione',
          priority: 'media',
          onPress: () =>
            navigation.navigate('CharityGiftCard', {
              title: 'Gift Card',
              subtitle: 'Regala solidarietà',
            }),
        },
      ],
    },
    {
      id: 'scopri',
      title: 'Esplora e Scopri',
      subtitle: 'Informati sui nostri eventi, impatto e risultati concreti',
      icon: '▲',
      color: colors.semantic?.info?.main ?? colors.primary[500],
      gradient: [
        colors.semantic?.info?.main ?? colors.primary[500],
        colors.primary[600],
      ] as [string, string],
      actions: [
        {
          id: 'calendario',
          title: 'Calendario',
          subtitle: 'Eventi da non perdere',
          icon: '📅',
          category: 'scopri',
          priority: 'alta',
          onPress: () =>
            navigation.navigate('Calendario', {
              title: 'Calendario',
              subtitle: 'Eventi e appuntamenti',
            }),
        },
        {
          id: 'tracciabilita',
          title: 'Tracciabilità',
          subtitle: 'Segui l impatto',
          icon: '📊',
          category: 'scopri',
          priority: 'media',
          onPress: () =>
            navigation.navigate('Tracciabilita', {
              title: 'Tracciabilità',
              subtitle: 'Segui l impatto delle donazioni',
            }),
        },
      ],
    },
    {
      id: 'connetti',
      title: 'Resta Connesso',
      subtitle: 'Unisciti alla nostra community globale di changemaker',
      icon: '■',
      color: colors.semantic?.success?.main ?? colors.primary[700],
      gradient: [
        colors.semantic?.success?.main ?? colors.primary[700],
        colors.primary[600],
      ] as [string, string],
      actions: [
        {
          id: 'seguici',
          title: 'Seguici',
          subtitle: 'Social e community',
          icon: '📱',
          category: 'connetti',
          priority: 'alta',
          onPress: () => navigation.navigate('Seguici'),
        },
        {
          id: 'chisiamo',
          title: 'Chi Siamo',
          subtitle: 'La nostra storia',
          icon: '🤝',
          category: 'connetti',
          priority: 'media',
          onPress: () => navigation.navigate('ChiSiamo'),
        },
      ],
    },
  ];

  const _handleActionPress = useCallback(
    async (action: InfoAction) => {
      await triggerHaptic('medium');
      action.onPress();
    },
    [triggerHaptic]
  );

  const closeInfoModal = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  const handleDonatePress = useCallback(() => {
    setShowInfoModal(false);
    navigation.navigate('Progetti');
  }, [navigation]);

  return (
    <SafeAreaView style={layoutStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={utilityStyles.scrollContentStyle}
      >
        {/* 🎯 PROFESSIONAL HEADER */}
        <Animated.View
          style={[
            layoutStyles.header,
            {
              opacity: animations.headerFade,
              transform: [
                {
                  translateY: animations.headerFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={layoutStyles.headerPattern}>
            <View style={utilityStyles.headerPatternLarge} />
            <View style={utilityStyles.headerPatternSmall} />
          </View>
          <View style={layoutStyles.titleGroup}>
            <Text style={layoutStyles.pageTitle}>
              Fai la{' '}
              <Text style={layoutStyles.pageTitleAccent}>Differenza</Text>
            </Text>
            <Text style={layoutStyles.pageSubtitle}>
              Trasforma ogni tua azione in un contributo concreto nella lotta
              globale contro la fame
            </Text>
            <View style={utilityStyles.headerStats}>
              <Animated.View
                style={[
                  utilityStyles.statItem,
                  {
                    transform: [{ scale: animations.statsAnimation }],
                  },
                ]}
              >
                <Text style={utilityStyles.statNumber}>4M+</Text>
                <Text style={utilityStyles.statLabel}>Pasti</Text>
              </Animated.View>
              <View style={utilityStyles.statDivider} />
              <Animated.View
                style={[
                  utilityStyles.statItem,
                  {
                    transform: [{ scale: animations.statsAnimation }],
                  },
                ]}
              >
                <Text style={utilityStyles.statNumber}>25+</Text>
                <Text style={utilityStyles.statLabel}>Paesi</Text>
              </Animated.View>
              <View style={utilityStyles.statDivider} />
              <Animated.View
                style={[
                  utilityStyles.statItem,
                  {
                    transform: [{ scale: animations.statsAnimation }],
                  },
                ]}
              >
                <Text style={utilityStyles.statNumber}>1.2M+</Text>
                <Text style={utilityStyles.statLabel}>Vite</Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* 🎛️ PROFESSIONAL SECTIONS */}
        <ProfessionalSectionsRenderer
          sections={professionalSections}
          contentReveal={animations.contentReveal}
          onActionPress={_handleActionPress}
        />
      </ScrollView>

      {/* 🎨 ELEGANT DONATION INFO MODAL */}
      <DonationInfoModal
        visible={showInfoModal}
        onClose={closeInfoModal}
        onDonate={handleDonatePress}
      />
    </SafeAreaView>
  );
};
