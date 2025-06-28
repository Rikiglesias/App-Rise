import React from 'react';
import { Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
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
      <Text style={styles.headerTitle}>I Nostri Progetti</Text>
      <Text style={styles.headerSubtitle}>
        Scopri dove stiamo facendo la differenza nel mondo{'\n'}
        contro la fame e la malnutrizione
      </Text>
    </View>
  )
);

ProjectsHeader.displayName = 'ProjectsHeader';

// Stats Section Component
export const ProjectsStats: React.FC<ProjectsStatsProps> = React.memo(
  ({ stats, styles }) => (
    <SectionContainer spacing="standard">
      <Surface style={styles.statsSurface} elevation={1}>
        <Text style={styles.statsTitle}>Progetti in Numeri</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Progetti{'\n'}Totali</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>In Corso{'\n'}Attualmente</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(stats.totalBeneficiaries / 1000).toFixed(0)}K+
            </Text>
            <Text style={styles.statLabel}>Persone{'\n'}Aiutate</Text>
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
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateText}>
        Nessun progetto trovato per questa categoria
      </Text>
    </View>
  )
);

ProjectsEmptyState.displayName = 'ProjectsEmptyState';
