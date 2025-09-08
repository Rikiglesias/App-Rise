import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { PlatformTouchable, PerfectText } from '../ui';

import type { MapModalData } from '../../data/mapModalData';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { Colors, Spacing, Typography } from '../../shared/constants';
import { logDebug } from '../../shared/utils/logger';
import { useResponsiveLayout } from '../../shared/hooks/useResponsive';

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
  const { spacing } = useResponsiveLayout();

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
          style={[
            styles.header,
            { paddingHorizontal: spacing.modal ?? Spacing[4] },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <PerfectText size={32} lines={1} style={styles.flag}>
                {data.flag}
              </PerfectText>
              <View style={styles.headerTextContainer}>
                <PerfectText size={20} lines={1} style={styles.title}>
                  {data.title}
                </PerfectText>
                <PerfectText size={14} lines={1} style={styles.subtitle}>
                  {data.subtitle}
                </PerfectText>
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
        <View
          style={[
            styles.content,
            { paddingHorizontal: spacing.modal ?? Spacing[6] },
          ]}
        >
          {/* Descrizione breve - max 2 righe */}
          <PerfectText
            size={16}
            lines={3}
            style={[
              styles.description,
              { paddingHorizontal: spacing.modal ?? Spacing[4] },
            ]}
          >
            Scopri il nostro impatto in {data.title} attraverso programmi di
            lotta alla fame e sviluppo sostenibile.
          </PerfectText>

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
            <PerfectText size={16} lines={1} style={styles.ctaText}>
              Clicca qui per saperne di più
            </PerfectText>
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
