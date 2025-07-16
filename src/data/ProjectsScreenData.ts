import type {
  ProjectStats,
  ProjectTab,
} from '../features/projects/types/ProjectsScreenTypes';

// Factory function for creating tabs based on stats
export const createProjectTabs = (stats: ProjectStats): ProjectTab[] => [
  {
    id: 'all',
    label: 'Tutti',
    count: stats.total,
    icon: '📋',
  },
  {
    id: 'active',
    label: 'In Corso',
    count: stats.active,
    icon: '🚀',
  },
  {
    id: 'completed',
    label: 'Completati',
    count: stats.completed,
    icon: '✅',
  },
  {
    id: 'upcoming',
    label: 'Prossimi',
    count: stats.upcoming,
    icon: '⏳',
  },
];

// Section title mapping
export const getSectionTitleByTab = (activeTab: string): string => {
  switch (activeTab) {
    case 'all':
      return 'Tutti i Progetti';
    case 'active':
      return 'Progetti in Corso';
    case 'completed':
      return 'Progetti Completati';
    case 'upcoming':
      return 'Progetti Prossimi';
    default:
      return 'Progetti';
  }
};
