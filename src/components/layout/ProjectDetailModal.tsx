import React from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';
import { PlatformScrollView, PlatformTouchable, PerfectText } from '../ui';

import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants';

interface Location {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  projects: number;
  beneficiaries: string;
  status: string;
  description: string;
  image: string;
}

interface Props {
  visible: boolean;
  location: Location | null;
  onClose: () => void;
  onDonate?: () => void;
  onVolunteer?: () => void;
}

const ProjectDetailModal: React.FC<Props> = ({
  visible,
  location,
  onClose,
  onDonate,
  onVolunteer,
}) => {
  if (!location) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.statusBadge}>
              <PerfectText size={14} lines={1} style={styles.statusText}>
                {location.status}
              </PerfectText>
            </View>
            <PlatformTouchable style={styles.closeButton} onPress={onClose}>
              <PerfectText size={16} lines={1} style={styles.closeButtonText}>
                ✕
              </PerfectText>
            </PlatformTouchable>
          </View>
        </View>

        <PlatformScrollView>
          {/* Hero Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: location.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <PerfectText size={20} lines={1} style={styles.locationName}>
                {location.name}
              </PerfectText>
              <PerfectText size={14} lines={1} style={styles.locationCountry}>
                {location.country}
              </PerfectText>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <PerfectText size={28} lines={1} style={styles.statNumber}>
                {location.projects}
              </PerfectText>
              <PerfectText size={12} lines={1} style={styles.statLabel}>
                Progetti Attivi
              </PerfectText>
              <View style={styles.statIcon}>
                <PerfectText size={18} lines={1}>
                  🎯
                </PerfectText>
              </View>
            </View>
            <View style={styles.statCard}>
              <PerfectText size={28} lines={1} style={styles.statNumber}>
                {location.beneficiaries}
              </PerfectText>
              <PerfectText size={12} lines={1} style={styles.statLabel}>
                Beneficiari
              </PerfectText>
              <View style={styles.statIcon}>
                <PerfectText size={18} lines={1}>
                  👥
                </PerfectText>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <PerfectText size={22} lines={1} style={styles.sectionTitle}>
              📝 Il Nostro Impatto
            </PerfectText>
            <PerfectText size={14} lines={4} style={styles.description}>
              {location.description}
            </PerfectText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <PerfectText size={20} lines={1} style={styles.sectionTitle}>
              🚀 Sostieni Questo Progetto
            </PerfectText>
            <View style={styles.buttonGrid}>
              <PlatformTouchable
                style={styles.primaryButton}
                onPress={
                  onDonate ??
                  (() => {
                    /* Empty handler */
                  })
                }
              >
                <PerfectText
                  size={16}
                  lines={1}
                  style={styles.primaryButtonText}
                >
                  💝 Dona Ora
                </PerfectText>
              </PlatformTouchable>
              <PlatformTouchable
                style={styles.secondaryButton}
                onPress={
                  onVolunteer ??
                  (() => {
                    /* Empty handler */
                  })
                }
              >
                <PerfectText
                  size={16}
                  lines={1}
                  style={styles.secondaryButtonText}
                >
                  🤝 Diventa Volontario
                </PerfectText>
              </PlatformTouchable>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </PlatformScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.neutral[0],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[4],
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },
  statusBadge: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: TypographyTokens.styles.body.small,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },
  closeButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TypographyTokens.styles.body.large,
    color: Colors.neutral[600],
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    margin: Spacing[4],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Spacing[4],
  },
  locationName: {
    fontSize: TypographyTokens.styles.title.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    marginBottom: Spacing[1],
  },
  locationCountry: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[200],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    position: 'relative',
    ...Shadows.md,
  },
  statNumber: {
    fontSize: TypographyTokens.styles.headline.small,
    fontWeight: Typography.weights.black,
    color: Colors.primary[600],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: TypographyTokens.styles.body.small,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  statIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },
  descriptionContainer: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: TypographyTokens.styles.title.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[3],
  },
  description: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[700],
    lineHeight: 24,
  },

  actionsContainer: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  buttonGrid: {
    gap: Spacing[3],
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },
  secondaryButton: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  secondaryButtonText: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  bottomSpacing: {
    height: Spacing[8],
  },
});

export default ProjectDetailModal;
