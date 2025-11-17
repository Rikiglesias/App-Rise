import React from 'react';
import type { ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import type {
  ProjectsEmptyStateProps,
  ProjectsHeaderProps,
  ProjectsStatsProps,
} from '../ProjectsScreenTypes';
import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { PerfectText } from '@/components/ui/PerfectText';
import SectionContainer from '@/components/layout/SectionContainer';
import { useTranslation } from '@/shared/hooks/useTranslation';

// Header Component
export const ProjectsHeader: React.FC<ProjectsHeaderProps> = React.memo(
  ({ styles }) => {
    const { t } = useTranslation();
    return (
      <PerfectContainer style={styles.header as ViewStyle}>
        <PerfectText
          size={24}
          lines={1}
          fontWeight="400"
          style={styles.headerTitle}
        >
          {t('projects.title')}
        </PerfectText>
        <PerfectText
          size={15}
          lines={2}
          fontWeight="400"
          style={styles.headerSubtitle}
        >
          {t('projects.subtitle')}
        </PerfectText>
      </PerfectContainer>
    );
  }
);

ProjectsHeader.displayName = 'ProjectsHeader';

// Stats Section Component
export const ProjectsStats: React.FC<ProjectsStatsProps> = React.memo(
  ({ stats, styles }) => {
    const { t } = useTranslation();
    return (
      <SectionContainer spacing="standard">
        <Surface style={styles.statsSurface} elevation={1}>
          <PerfectText
            size={16}
            lines={1}
            fontWeight="400"
            style={styles.statsTitle}
          >
            {t('projects.statsTitle')}
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
                {t('projects.totalProjects')}
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
                {t('projects.activeProjects')}
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
                {t('projects.peopleHelped')}
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>
        </Surface>
      </SectionContainer>
    );
  }
);

ProjectsStats.displayName = 'ProjectsStats';

// Empty State Component
export const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = React.memo(
  ({ styles }) => {
    const { t } = useTranslation();
    return (
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
          {t('projects.emptyState')}
        </PerfectText>
      </PerfectContainer>
    );
  }
);

ProjectsEmptyState.displayName = 'ProjectsEmptyState';
