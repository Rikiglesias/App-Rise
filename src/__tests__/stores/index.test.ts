import * as stores from '../../stores';

describe('stores/index exports', () => {
  it('exports store hooks', () => {
    expect(typeof stores.useAppStore).toBe('function');
    expect(typeof stores.useProjectsStore).toBe('function');
    expect(typeof stores.useImpactStore).toBe('function');
  });

  it('exports selector hooks', () => {
    const keys = [
      'useAppLoading',
      'useAppError',
      'useAppUIState',
      'useAppActions',
      'useAllProjects',
      'useActiveProjects',
      'useCompletedProjects',
      'useUpcomingProjects',
      'useProjectsStats',
      'useSelectedProject',
      'useProjectsUIState',
      'useProjectsActions',
      'useFilteredProjects',
      'useImpactStats',
      'useMealsStats',
      'useVolunteersStats',
      'useKitsStats',
      'useImpactProgress',
      'useImpactUIState',
      'useImpactActions',
      'useImpactTotals',
      'useGlobalLoadingState',
      'useGlobalErrorState',
      'useDashboardOverview',
    ] as const;

    for (const k of keys) {
      expect(typeof (stores as Record<string, unknown>)[k]).toBe('function');
    }
  });
});
