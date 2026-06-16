import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { PerfectModal } from '../ui/PerfectModal';
import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '../ui';
import { PerfectImage } from '../ui/PerfectImage';

import {
  BorderRadius,
  Colors,
  Shadows,
  PerfectSpacing,
} from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import type { ThemeColors } from '../../shared/theme/adaptiveColors';
import type { Location } from '@/shared/types/location';

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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!location) return null;

  return (
    <PerfectModal visible={visible} onRequestClose={onClose} size="large">
      <PerfectContainer style={styles.container}>
        {/* Header */}
        <PerfectContainer style={styles.header}>
          <PerfectContainer style={styles.headerContent}>
            <PerfectContainer style={styles.statusBadge}>
              <PerfectText
                size={14}
                lines={1}
                fontWeight="400"
                style={styles.statusText}
              >
                {location.status}
              </PerfectText>
            </PerfectContainer>
            <PlatformTouchable style={styles.closeButton} onPress={onClose}>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.closeButtonText}
              >
                ✕
              </PerfectText>
            </PlatformTouchable>
          </PerfectContainer>
        </PerfectContainer>

        <PlatformScrollView>
          {/* Hero Image */}
          <PerfectContainer style={styles.imageContainer}>
            <PerfectImage
              // iPhone 15 reference: full width minus horizontal margins (16*2 = 32)
              width={361}
              height={250}
              borderRadius={24}
              source={{ uri: location.image }}
            />
            <PerfectContainer style={styles.imageOverlay}>
              <PerfectText
                size={20}
                lines={1}
                fontWeight="400"
                style={styles.locationName}
              >
                {location.name}
              </PerfectText>
              <PerfectText
                size={14}
                lines={1}
                fontWeight="400"
                style={styles.locationCountry}
              >
                {location.country}
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>

          {/* Stats Cards */}
          <PerfectContainer style={styles.statsContainer}>
            <PerfectContainer style={styles.statCard}>
              <PerfectText
                size={28}
                lines={1}
                fontWeight="400"
                style={styles.statNumber}
              >
                {location.projects}
              </PerfectText>
              <PerfectText
                size={12}
                lines={1}
                fontWeight="400"
                style={styles.statLabel}
              >
                Progetti Attivi
              </PerfectText>
              <PerfectContainer style={styles.statIcon}>
                <PerfectText size={18} lines={1} fontWeight="400">
                  🎯
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>
            <PerfectContainer style={styles.statCard}>
              <PerfectText
                size={28}
                lines={1}
                fontWeight="400"
                style={styles.statNumber}
              >
                {location.beneficiaries}
              </PerfectText>
              <PerfectText
                size={12}
                lines={1}
                fontWeight="400"
                style={styles.statLabel}
              >
                Beneficiari
              </PerfectText>
              <PerfectContainer style={styles.statIcon}>
                <PerfectText size={18} lines={1} fontWeight="400">
                  👥
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>

          {/* Description */}
          <PerfectContainer style={styles.descriptionContainer}>
            <PerfectText
              size={22}
              lines={1}
              fontWeight="400"
              style={styles.sectionTitle}
            >
              📝 Il Nostro Impatto
            </PerfectText>
            <PerfectText
              size={14}
              lines={4}
              fontWeight="400"
              style={styles.description}
            >
              {location.description}
            </PerfectText>
          </PerfectContainer>

          {/* Action Buttons */}
          <PerfectContainer style={styles.actionsContainer}>
            <PerfectText
              size={20}
              lines={1}
              fontWeight="400"
              style={styles.sectionTitle}
            >
              🚀 Sostieni Questo Progetto
            </PerfectText>
            <PerfectContainer style={styles.buttonGrid}>
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
                  fontWeight="400"
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
                  fontWeight="400"
                  style={styles.secondaryButtonText}
                >
                  🤝 Diventa Volontario
                </PerfectText>
              </PlatformTouchable>
            </PerfectContainer>
          </PerfectContainer>

          {/* Bottom Spacing */}
          <PerfectContainer style={styles.bottomSpacing} />
        </PlatformScrollView>
      </PerfectContainer>
    </PerfectModal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },
    header: {
      backgroundColor: colors.neutral[0],
      paddingTop: PerfectSpacing['3xl'],
      paddingBottom: PerfectSpacing.base,
      ...Shadows.sm,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: PerfectSpacing.base,
    },
    statusBadge: {
      backgroundColor: colors.primary[600],
      paddingHorizontal: PerfectSpacing.md,
      paddingVertical: PerfectSpacing.xs,
      borderRadius: BorderRadius.full,
    },
    // Testo su badge brand rosso -> bianco fisso
    statusText: {
      color: Colors.accent.white,
    },
    closeButton: {
      backgroundColor: colors.neutral[100],
      borderRadius: BorderRadius.full,
      width: scale(36),
      height: scale(36),
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      color: colors.neutral[600],
    },
    imageContainer: {
      position: 'relative',
      height: scale(250),
      margin: PerfectSpacing.base,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...Shadows.lg,
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      // rgba necessario per overlay gradient semi-trasparente su immagine
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: PerfectSpacing.base,
    },
    // Testo su scrim foto scuro -> colori fissi (theme-independent)
    locationName: {
      color: Colors.accent.white,
      marginBottom: PerfectSpacing.xs,
    },
    locationCountry: {
      color: Colors.neutral[200],
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: PerfectSpacing.base,
      marginBottom: PerfectSpacing.lg,
      gap: PerfectSpacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.xl,
      padding: PerfectSpacing.base,
      alignItems: 'center',
      position: 'relative',
      ...Shadows.md,
    },
    statNumber: {
      color: colors.primary[600],
      marginBottom: PerfectSpacing.xs,
    },
    statLabel: {
      color: colors.neutral[600],
      textAlign: 'center',
    },
    statIcon: {
      position: 'absolute',
      top: PerfectSpacing.sm,
      right: PerfectSpacing.sm,
    },
    descriptionContainer: {
      paddingHorizontal: PerfectSpacing.base,
      marginBottom: PerfectSpacing.lg,
    },
    sectionTitle: {
      color: colors.neutral[900],
      marginBottom: PerfectSpacing.md,
    },
    description: {
      color: colors.neutral[700],
    },

    actionsContainer: {
      paddingHorizontal: PerfectSpacing.base,
      marginBottom: PerfectSpacing.lg,
    },
    buttonGrid: {
      gap: PerfectSpacing.md,
    },
    primaryButton: {
      backgroundColor: colors.primary[600],
      borderRadius: BorderRadius.xl,
      paddingVertical: PerfectSpacing.base,
      alignItems: 'center',
      ...Shadows.md,
    },
    // Testo su bottone brand rosso -> bianco fisso
    primaryButtonText: {
      color: Colors.accent.white,
    },
    secondaryButton: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.xl,
      paddingVertical: PerfectSpacing.base,
      alignItems: 'center',
      borderWidth: scale(2),
      borderColor: colors.primary[600],
    },
    secondaryButtonText: {
      color: colors.primary[600],
    },
    bottomSpacing: {
      height: PerfectSpacing.xl,
    },
  });

export default ProjectDetailModal;
