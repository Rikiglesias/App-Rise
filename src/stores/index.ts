// Store hooks
export { useAppStore } from './appStore';
export { useImpactStore } from './impactStore';
export { useProjectsStore } from './projectsStore';

// Memoized selectors for performance optimization
export {
  // App Store Selectors
  useAppLoading,
  useAppError,
  useAppUIState,
  useAppActions,

  // Projects Store Selectors
  useAllProjects,
  useActiveProjects,
  useCompletedProjects,
  useUpcomingProjects,
  useProjectsStats,
  useSelectedProject,
  useProjectsUIState,
  useProjectsActions,
  useFilteredProjects,

  // Impact Store Selectors
  useImpactStats,
  useMealsStats,
  useVolunteersStats,
  useKitsStats,
  useImpactProgress,
  useImpactUIState,
  useImpactActions,
  useImpactTotals,

  // Combined Selectors
  useGlobalLoadingState,
  useGlobalErrorState,
  useDashboardOverview,
} from './selectors';

// Types
export type { AppState, ImpactState, ProjectsState } from './types';
