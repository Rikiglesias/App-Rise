/* eslint-disable max-lines-per-function */
import { renderHook, act } from '@testing-library/react-native';
import {
  useAppLoading,
  useAppError,
  useAppUIState,
  useActiveProjects,
  useCompletedProjects,
  useProjectsStats,
  useImpactProgress,
  useGlobalLoadingState,
  useDashboardOverview,
} from '../../stores/selectors';
import { useAppStore } from '../../stores/appStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useImpactStore } from '../../stores/impactStore';

// Mock data
const mockProjects = [
  {
    id: '1',
    title: 'Active Project',
    location: 'Location 1',
    description: 'Description 1',
    impact: 'Impact 1',
    status: 'active' as const,
    progress: 50,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Completed Project',
    location: 'Location 2',
    description: 'Description 2',
    impact: 'Impact 2',
    status: 'completed' as const,
    progress: 100,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    title: 'Upcoming Project',
    location: 'Location 3',
    description: 'Description 3',
    impact: 'Impact 3',
    status: 'upcoming' as const,
    progress: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('Store Selectors', () => {
  beforeEach(() => {
    // Reset all stores
    useAppStore.setState({
      isLoading: false,
      error: null,
      lastUpdated: null,
    });

    useProjectsStore.setState({
      projects: mockProjects,
      selectedProject: null,
      isLoading: false,
      error: null,
    });

    useImpactStore.setState({
      stats: {
        meals: {
          current: 1000,
          target: 2000,
          label: 'Pasti',
          sublabel: 'Test',
        },
        volunteers: {
          current: 500,
          target: 1000,
          label: 'Volontari',
          sublabel: 'Test',
        },
        kits: { current: 200, target: 400, label: 'Kit', sublabel: 'Test' },
      },
      isLoading: false,
      error: null,
    });
  });

  describe('App Store Selectors', () => {
    it('useAppLoading should return only loading state', () => {
      const { result } = renderHook(() => useAppLoading());
      expect(result.current).toBe(false);

      act(() => {
        useAppStore.getState().setLoading(true);
      });

      expect(result.current).toBe(true);
    });

    it('useAppError should return only error state', () => {
      const { result } = renderHook(() => useAppError());
      expect(result.current).toBeNull();

      act(() => {
        useAppStore.getState().setError('Test error');
      });

      expect(result.current).toBe('Test error');
    });

    it('useAppUIState should return combined UI state', () => {
      const { result } = renderHook(() => useAppUIState());

      expect(result.current).toEqual({
        isLoading: false,
        error: null,
        hasError: false,
      });

      act(() => {
        useAppStore.getState().setLoading(true);
        useAppStore.getState().setError('Test error');
      });

      expect(result.current).toEqual({
        isLoading: true,
        error: 'Test error',
        hasError: true,
      });
    });
  });

  describe('Projects Store Selectors', () => {
    it('useActiveProjects should return only active projects', () => {
      const { result } = renderHook(() => useActiveProjects());

      expect(result.current).toHaveLength(1);
      expect(result.current[0]?.status).toBe('active');
      expect(result.current[0]?.title).toBe('Active Project');
    });

    it('useCompletedProjects should return only completed projects', () => {
      const { result } = renderHook(() => useCompletedProjects());

      expect(result.current).toHaveLength(1);
      expect(result.current[0]?.status).toBe('completed');
      expect(result.current[0]?.title).toBe('Completed Project');
    });

    it('useProjectsStats should return correct statistics', () => {
      const { result } = renderHook(() => useProjectsStats());

      expect(result.current).toEqual({
        total: 3,
        active: 1,
        completed: 1,
        upcoming: 1,
      });
    });

    it('should update when projects change', () => {
      const { result } = renderHook(() => useActiveProjects());

      expect(result.current).toHaveLength(1);

      act(() => {
        useProjectsStore.getState().addProject({
          id: '4',
          title: 'New Active Project',
          location: 'Location 4',
          description: 'Description 4',
          impact: 'Impact 4',
          status: 'active',
          progress: 25,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        });
      });

      expect(result.current).toHaveLength(2);
    });
  });

  describe('Impact Store Selectors', () => {
    it('useImpactProgress should calculate correct percentages', () => {
      const { result } = renderHook(() => useImpactProgress());

      expect(result.current).toEqual({
        meals: 50, // 1000/2000 * 100
        volunteers: 50, // 500/1000 * 100
        kits: 50, // 200/400 * 100
      });
    });

    it('should update when stats change', () => {
      const { result } = renderHook(() => useImpactProgress());

      expect(result.current.meals).toBe(50);

      act(() => {
        useImpactStore.getState().updateStat('meals', { current: 1500 });
      });

      expect(result.current.meals).toBe(75); // 1500/2000 * 100
    });
  });

  describe('Combined Selectors', () => {
    it('useGlobalLoadingState should combine loading from all stores', () => {
      const { result } = renderHook(() => useGlobalLoadingState());

      expect(result.current.isAnyLoading).toBe(false);
      expect(result.current.loadingStates).toEqual({
        app: false,
        projects: false,
        impact: false,
      });

      act(() => {
        useProjectsStore.getState().setLoading(true);
      });

      expect(result.current.isAnyLoading).toBe(true);
      expect(result.current.loadingStates.projects).toBe(true);
    });

    it('useDashboardOverview should provide comprehensive overview', () => {
      const { result } = renderHook(() => useDashboardOverview());

      expect(result.current.projects).toEqual({
        total: 3,
        active: 1,
        completed: 1,
        upcoming: 1,
      });

      expect(result.current.impact).toEqual({
        meals: 50,
        volunteers: 50,
        kits: 50,
      });

      expect(result.current.loading.isAnyLoading).toBe(false);
      expect(result.current.errors.hasAnyError).toBe(false);
      expect(result.current.isReady).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should not re-render when unrelated state changes', () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useActiveProjects();
      });

      expect(renderCount).toBe(1);
      expect(result.current).toHaveLength(1);

      // Change unrelated state (app loading)
      act(() => {
        useAppStore.getState().setLoading(true);
      });

      // Should not cause re-render of useActiveProjects
      expect(renderCount).toBe(1);

      // Change related state (projects)
      act(() => {
        useProjectsStore.getState().addProject({
          id: '5',
          title: 'Another Active Project',
          location: 'Location 5',
          description: 'Description 5',
          impact: 'Impact 5',
          status: 'active',
          progress: 75,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        });
      });

      // Should cause re-render
      expect(renderCount).toBe(2);
      expect(result.current).toHaveLength(2);
    });

    it('should memoize calculated values correctly', () => {
      const { result, rerender } = renderHook(() => useProjectsStats());

      const firstResult = result.current;

      // Force re-render without changing state
      rerender({});

      // Should return the same object reference (memoized)
      expect(result.current).toBe(firstResult);

      // Change state
      act(() => {
        useProjectsStore.getState().addProject({
          id: '6',
          title: 'New Project',
          location: 'Location 6',
          description: 'Description 6',
          impact: 'Impact 6',
          status: 'active',
          progress: 0,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        });
      });

      // Should return new object with updated values
      expect(result.current).not.toBe(firstResult);
      expect(result.current.total).toBe(4);
      expect(result.current.active).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty projects array', () => {
      act(() => {
        useProjectsStore.getState().setProjects([]);
      });

      const { result: activeResult } = renderHook(() => useActiveProjects());
      const { result: statsResult } = renderHook(() => useProjectsStats());

      expect(activeResult.current).toHaveLength(0);
      expect(statsResult.current).toEqual({
        total: 0,
        active: 0,
        completed: 0,
        upcoming: 0,
      });
    });

    it('should handle zero values in impact calculations', () => {
      act(() => {
        useImpactStore.getState().setStats({
          meals: { current: 0, target: 0, label: 'Pasti', sublabel: 'Test' },
          volunteers: {
            current: 0,
            target: 100,
            label: 'Volontari',
            sublabel: 'Test',
          },
          kits: { current: 50, target: 0, label: 'Kit', sublabel: 'Test' },
        });
      });

      const { result } = renderHook(() => useImpactProgress());

      expect(result.current.meals).toBeNaN(); // 0/0
      expect(result.current.volunteers).toBe(0); // 0/100
      expect(result.current.kits).toBe(Infinity); // 50/0
    });
  });
});
