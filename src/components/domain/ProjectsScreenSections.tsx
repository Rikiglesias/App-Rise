import React from 'react';
import type { ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { PerfectContainer } from '../ui/PerfectContainer';
import { PerfectText } from '../ui/PerfectText';
import type {
  ProjectsEmptyStateProps,
  ProjectsHeaderProps,
  ProjectsStatsProps,
} from '../../features/projects/types/ProjectsScreenTypes';
import SectionContainer from '../layout/SectionContainer';

// Header Component
export const ProjectsHeader: React.FC<ProjectsHeaderProps> = React.memo(
  ({ styles }) => (
    <PerfectContainer style={styles.header as ViewStyle}>
      <PerfectText
        size={24}
        lines={1}
        fontWeight="400"
        style={styles.headerTitle}
      >
        I Nostri Progetti
      </PerfectText>
      <PerfectText
        size={15}
        lines={2}
        fontWeight="400"
        style={styles.headerSubtitle}
      >
        Scopri dove stiamo facendo la differenza nel mondo{'\n'}
        nella lotta alla fame
      </PerfectText>
    </PerfectContainer>
  )
);

ProjectsHeader.displayName = 'ProjectsHeader';

// Stats Section Component
export const ProjectsStats: React.FC<ProjectsStatsProps> = React.memo(
  ({ stats, styles }) => (
    <SectionContainer spacing="standard">
      <Surface style={styles.statsSurface} elevation={1}>
        <PerfectText
          size={16}
          lines={1}
          fontWeight="400"
          style={styles.statsTitle}
        >
          Progetti in Numeri
        </PerfectText>
        <PerfectContainer style={styles.statsRow as ViewStyle}>
          <PerfectContainer style={styles.statItem as ViewStyle}>
            <PerfectText
              size={22}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              {stats.total}
            </PerfectText>
            <PerfectText
              size={12}
              lines={2}
              fontWeight="400"
              style={styles.statLabel}
            >
              Progetti{'\n'}Totali
            </PerfectText>
          </PerfectContainer>
          <PerfectContainer style={styles.statItem as ViewStyle}>
            <PerfectText
              size={22}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              {stats.active}
            </PerfectText>
            <PerfectText
              size={12}
              lines={2}
              fontWeight="400"
              style={styles.statLabel}
            >
              In Corso{'\n'}Attualmente
            </PerfectText>
          </PerfectContainer>
          <PerfectContainer style={styles.statItem as ViewStyle}>
            <PerfectText
              size={22}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              {(stats.totalBeneficiaries / 1000).toFixed(0)}K+
            </PerfectText>
            <PerfectText
              size={12}
              lines={2}
              fontWeight="400"
              style={styles.statLabel}
            >
              Persone{'\n'}Aiutate
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>
      </Surface>
    </SectionContainer>
  )
);

ProjectsStats.displayName = 'ProjectsStats';

// Empty State Component
export const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = React.memo(
  ({ styles }) => (
    <PerfectContainer style={styles.emptyState as ViewStyle}>
      <PerfectText
        size={48}
        lines={1}
        fontWeight="400"
        style={styles.emptyStateIcon}
      >
        📦
      </PerfectText>
      <PerfectText
        size={15}
        lines={2}
        fontWeight="400"
        style={styles.emptyStateText}
      >
        Nessun progetto trovato per questa categoria
      </PerfectText>
    </PerfectContainer>
  )
);

ProjectsEmptyState.displayName = 'ProjectsEmptyState';
