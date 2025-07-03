import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { PlatformTouchable, FormattedText } from '../ui';

import type { MapModalData } from '../../data/mapModalData';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { Colors, Spacing, Typography } from '../../shared/constants';
import { logDebug } from '../../shared/utils/logger';

interface MapLocationModalProps {
  visible: boolean;
  data: MapModalData | null;
  onClose: () => void;
}

const gradientStart = { x: 0, y: 0 };
const gradientEnd = { x: 1, y: 1 };

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const handleCTAPress = useCallback(() => {
    logDebug('MapLocationModal', 'CTA pressed', { title: data?.title });
    // Note: External links functionality would require extending MapModalData interface
  }, [data?.title]);

  if (!data) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header compatto con gradient */}
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={gradientStart}
          end={gradientEnd}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <FormattedText variant="headline-large" style={styles.flag}>
                {data.flag}
              </FormattedText>
              <View style={styles.headerTextContainer}>
                <FormattedText variant="headline-small" style={styles.title}>
                  {data.title}
                </FormattedText>
                <FormattedText variant="body-medium" style={styles.subtitle}>
                  {data.subtitle}
                </FormattedText>
              </View>
            </View>

            <PlatformTouchable
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.neutral[0]}
              />
            </PlatformTouchable>
          </View>
        </LinearGradient>

        {/* Contenuto semplificato */}
        <View style={styles.content}>
          {/* Descrizione breve - max 2 righe */}
          <FormattedText variant="body-large" style={styles.description}>
            Scopri il nostro impatto in {data.title} attraverso programmi di
            lotta alla fame e sviluppo sostenibile.
          </FormattedText>

          {/* Call to Action per link esterno */}
          <PlatformTouchable
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={handleCTAPress}
          >
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={Colors.neutral[0]}
              style={styles.ctaIcon}
            />
            <FormattedText variant="body-large" style={styles.ctaText}>
              Clicca qui per saperne di più
            </FormattedText>
          </PlatformTouchable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },

  // Header compatto
  header: {
    paddingTop: Spacing[12],
    paddingBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    marginRight: Spacing[3],
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: TypographyTokens.styles.title.large,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[100],
    opacity: 0.9,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Contenuto semplificato
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Descrizione breve
  description: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing[10],
    paddingHorizontal: Spacing[4],
  },

  // Call to Action button
  ctaButton: {
    backgroundColor: '#DC2626',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[8],
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 280,
  },
  ctaIcon: {
    marginRight: Spacing[2],
  },
  ctaText: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
  },
});

export default MapLocationModal;
