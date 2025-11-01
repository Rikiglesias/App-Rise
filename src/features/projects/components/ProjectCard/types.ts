export interface ProjectCardProps {
  readonly title: string;
  readonly location: string;
  readonly description: string;
  readonly impact: string;
  readonly status: ProjectStatus;
  readonly progress?: number | undefined; // 0-100
  readonly onPress?: () => void;
}

export type ProjectStatus = 'active' | 'completed' | 'upcoming';

export interface ProjectHeaderProps {
  readonly title: string;
  readonly location: string;
  readonly statusColor: string;
  readonly statusText: string;
}

export interface ProjectContentProps {
  readonly description: string;
  readonly impact: string;
}

export interface ProjectProgressProps {
  readonly progress: number;
  readonly statusColor: string;
}
