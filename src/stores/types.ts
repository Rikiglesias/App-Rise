// ===================================================================
// STORE TYPES
// ===================================================================

export interface Project {
  id: string;
  title: string;
  location: string;
  description: string;
  impact: string;
  status: 'active' | 'completed' | 'upcoming';
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactStats {
  meals: {
    current: number;
    target: number;
    label: string;
    sublabel: string;
  };
  volunteers: {
    current: number;
    target: number;
    label: string;
    sublabel: string;
  };
  kits: {
    current: number;
    target: number;
    label: string;
    sublabel: string;
  };
}

// ===================================================================
// STATE INTERFACES
// ===================================================================

export interface AppState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (timestamp: string) => void;
  clearError: () => void;
}

export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface ImpactState {
  stats: ImpactStats;
  isLoading: boolean;
  error: string | null;
  // Actions
  setStats: (stats: ImpactStats) => void;
  updateStat: (
    category: keyof ImpactStats,
    updates: Partial<ImpactStats[keyof ImpactStats]>
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
