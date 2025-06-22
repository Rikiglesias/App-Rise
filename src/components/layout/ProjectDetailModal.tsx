import React from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../ui';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

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
              <Text style={styles.statusText}>{location.status}</Text>
            </View>
            <PlatformTouchable
              style={styles.closeButton}
              onPress={onClose}
              rippleColor="rgba(220, 38, 38, 0.2)"
            >
              <Text style={styles.closeButtonText}>✕</Text>
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
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationCountry}>{location.country}</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{location.projects}</Text>
              <Text style={styles.statLabel}>Progetti Attivi</Text>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>🎯</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{location.beneficiaries}</Text>
              <Text style={styles.statLabel}>Beneficiari</Text>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>👥</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>📝 Il Nostro Impatto</Text>
            <Text style={styles.description}>{location.description}</Text>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>🏆 Risultati Raggiunti</Text>
            <View style={styles.achievementsList}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>🍽️</Text>
                <Text style={styles.achievementText}>
                  Pasti distribuiti regolarmente
                </Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>🏫</Text>
                <Text style={styles.achievementText}>
                  Partnership con scuole locali
                </Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>🌱</Text>
                <Text style={styles.achievementText}>
                  Programmi sostenibilità
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>🚀 Sostieni Questo Progetto</Text>
            <View style={styles.buttonGrid}>
              <PlatformTouchable
                style={styles.primaryButton}
                onPress={
                  onDonate ??
                  (() => {
                    /* Empty handler */
                  })
                }
                rippleColor="rgba(220, 38, 38, 0.2)"
              >
                <Text style={styles.primaryButtonText}>💝 Dona Ora</Text>
              </PlatformTouchable>
              <PlatformTouchable
                style={styles.secondaryButton}
                onPress={
                  onVolunteer ??
                  (() => {
                    /* Empty handler */
                  })
                }
                rippleColor="rgba(220, 38, 38, 0.2)"
              >
                <Text style={styles.secondaryButtonText}>
                  🤝 Diventa Volontario
                </Text>
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
    fontSize: Typography.sizes.sm,
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
    fontSize: Typography.sizes.lg,
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
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    marginBottom: Spacing[1],
  },
  locationCountry: {
    fontSize: Typography.sizes.base,
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
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: Colors.primary[600],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  statIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },
  statEmoji: {
    fontSize: 20,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[3],
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  achievementsContainer: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  achievementsList: {
    gap: Spacing[3],
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: Spacing[3],
  },
  achievementText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    flex: 1,
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
    fontSize: Typography.sizes.lg,
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
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  bottomSpacing: {
    height: Spacing[8],
  },
});

export default ProjectDetailModal;
