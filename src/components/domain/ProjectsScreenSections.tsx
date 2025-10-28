import React from 'react';
import { View } from 'react-native';
import { Surface } from 'react-native-paper';
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
    <View style={styles.header}>
      <PerfectText size={24} lines={1} style={styles.headerTitle}>
        I Nostri Progetti
      </PerfectText>
      <PerfectText size={15} lines={2} style={styles.headerSubtitle}>
        Scopri dove stiamo facendo la differenza nel mondo{'\n'}
        contro la fame e la malnutrizione
      </PerfectText>
    </View>
  )
);

ProjectsHeader.displayName = 'ProjectsHeader';

// Stats Section Component
export const ProjectsStats: React.FC<ProjectsStatsProps> = React.memo(
  ({ stats, styles }) => (
    <SectionContainer spacing="standard">
      <Surface style={styles.statsSurface} elevation={1}>
        <PerfectText size={16} lines={1} style={styles.statsTitle}>
          Progetti in Numeri
        </PerfectText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <PerfectText size={22} lines={1} style={styles.statNumber}>
              {stats.total}
            </PerfectText>
            <PerfectText size={12} lines={2} style={styles.statLabel}>
              Progetti{'\n'}Totali
            </PerfectText>
          </View>
          <View style={styles.statItem}>
            <PerfectText size={22} lines={1} style={styles.statNumber}>
              {stats.active}
            </PerfectText>
            <PerfectText size={12} lines={2} style={styles.statLabel}>
              In Corso{'\n'}Attualmente
            </PerfectText>
          </View>
          <View style={styles.statItem}>
            <PerfectText size={22} lines={1} style={styles.statNumber}>
              {(stats.totalBeneficiaries / 1000).toFixed(0)}K+
            </PerfectText>
            <PerfectText size={12} lines={2} style={styles.statLabel}>
              Persone{'\n'}Aiutate
            </PerfectText>
          </View>
        </View>
      </Surface>
    </SectionContainer>
  )
);

ProjectsStats.displayName = 'ProjectsStats';

// Empty State Component
export const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = React.memo(
  ({ styles }) => (
    <View style={styles.emptyState}>
      <PerfectText size={48} lines={1} style={styles.emptyStateIcon}>
        📦
      </PerfectText>
      <PerfectText size={15} lines={2} style={styles.emptyStateText}>
        Nessun progetto trovato per questa categoria
      </PerfectText>
    </View>
  )
);

ProjectsEmptyState.displayName = 'ProjectsEmptyState';
