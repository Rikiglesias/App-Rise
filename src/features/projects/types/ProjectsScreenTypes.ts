import type { StackNavigationProp } from '@react-navigation/stack';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { RootStackParamList } from '../../../navigation/types';

export type ProjectsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Progetti'
>;

export interface ProjectsScreenProps {
  navigation: ProjectsScreenNavigationProp;
}

// Type definition for Project
export interface Project {
  readonly id: string;
  readonly title: string;
  readonly location: string;
  readonly description: string;
  readonly impact: string;
  readonly status: 'active' | 'completed' | 'upcoming';
  readonly progress?: number;
}

export interface ProjectTab {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly icon: string;
}

export interface ProjectStats {
  readonly total: number;
  readonly active: number;
  readonly completed: number;
  readonly upcoming: number;
  readonly totalBeneficiaries: number;
}

export interface ProjectsScreenLogicReturn {
  readonly projects: Project[];
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
  readonly refreshing: boolean;
  readonly stats: ProjectStats;
  readonly tabs: ProjectTab[];
  readonly filteredProjects: Project[];
  readonly handleRefresh: () => Promise<void>;
  readonly createProjectPressHandler: (projectId: string) => () => void;
  readonly getSectionTitle: () => string;
  // Project Detail Modal
  readonly selectedProject: Project | null;
  readonly isProjectDetailVisible: boolean;
  readonly handleCloseProjectDetail: () => void;
}

// Type for styles to avoid circular imports
export type ProjectsScreenStyles = Record<
  string,
  ViewStyle | TextStyle | ImageStyle
>;

export interface ProjectsHeaderProps {
  readonly styles: ProjectsScreenStyles;
}

export interface ProjectsStatsProps {
  readonly stats: ProjectStats;
  readonly styles: ProjectsScreenStyles;
}

export interface ProjectsEmptyStateProps {
  readonly styles: ProjectsScreenStyles;
}
