/* eslint-disable max-lines-per-function */
import { useImpactStore } from '../../stores/impactStore';

describe('useImpactStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useImpactStore.setState({
      stats: {
        meals: {
          current: 0,
          target: 4000000,
          label: 'Pasti',
          sublabel: 'Obiettivo 4M entro 2025',
        },
        volunteers: {
          current: 0,
          target: 20000,
          label: 'Volontari',
          sublabel: 'Target 20K volontari',
        },
        kits: {
          current: 0,
          target: 25000,
          label: 'Kit Distribuiti',
          sublabel: 'Target 25K kit',
        },
      },
      heroStories: [],
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial structure', () => {
      const state = useImpactStore.getState();

      expect(state.stats).toBeDefined();
      expect(state.stats.meals).toBeDefined();
      expect(state.stats.volunteers).toBeDefined();
      expect(state.stats.kits).toBeDefined();
      expect(state.heroStories).toBeDefined();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should have correct stat structure', () => {
      const state = useImpactStore.getState();

      expect(state.stats.meals.current).toBe(0);
      expect(state.stats.meals.target).toBe(4000000);
      expect(state.stats.meals.label).toBe('Pasti');
      expect(state.stats.meals.sublabel).toBe('Obiettivo 4M entro 2025');
    });
  });

  describe('setStats', () => {
    it('should update all stats', () => {
      const newStats = {
        meals: {
          current: 1000,
          target: 4000000,
          label: 'Pasti',
          sublabel: 'Obiettivo 4M entro 2025',
        },
        volunteers: {
          current: 50,
          target: 20000,
          label: 'Volontari',
          sublabel: 'Target 20K volontari',
        },
        kits: {
          current: 200,
          target: 25000,
          label: 'Kit Distribuiti',
          sublabel: 'Target 25K kit',
        },
      };

      useImpactStore.getState().setStats(newStats);
      const state = useImpactStore.getState();

      expect(state.stats.meals.current).toBe(1000);
      expect(state.stats.volunteers.current).toBe(50);
      expect(state.stats.kits.current).toBe(200);
    });
  });

  describe('updateStat', () => {
    it('should update individual stat', () => {
      useImpactStore.getState().updateStat('meals', { current: 1500 });

      const state = useImpactStore.getState();
      expect(state.stats.meals.current).toBe(1500);
      expect(state.stats.meals.target).toBe(4000000); // Should remain unchanged
    });

    it('should update multiple properties of a stat', () => {
      useImpactStore.getState().updateStat('volunteers', {
        current: 100,
        target: 25000,
      });

      const state = useImpactStore.getState();
      expect(state.stats.volunteers.current).toBe(100);
      expect(state.stats.volunteers.target).toBe(25000);
    });
  });

  describe('setHeroStories', () => {
    it('should update hero stories', () => {
      const stories = [
        {
          id: '1',
          title: 'Test Story',
          location: 'Test Location',
          impact: 'Test Impact',
          image: 123,
          accessibilityLabel: 'Test Label',
          color: '#FF0000',
        },
      ];

      useImpactStore.getState().setHeroStories(stories);
      const state = useImpactStore.getState();

      expect(state.heroStories).toEqual(stories);
    });

    it('should handle empty stories array', () => {
      useImpactStore.getState().setHeroStories([]);
      const state = useImpactStore.getState();

      expect(state.heroStories).toEqual([]);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      useImpactStore.getState().setLoading(true);
      expect(useImpactStore.getState().isLoading).toBe(true);

      useImpactStore.getState().setLoading(false);
      expect(useImpactStore.getState().isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error state', () => {
      const errorMessage = 'Failed to fetch data';

      useImpactStore.getState().setError(errorMessage);
      expect(useImpactStore.getState().error).toBe(errorMessage);
    });

    it('should clear error', () => {
      useImpactStore.getState().setError('Some error');
      useImpactStore.getState().clearError();

      expect(useImpactStore.getState().error).toBe(null);
    });

    it('should set error to null', () => {
      useImpactStore.getState().setError('Some error');
      useImpactStore.getState().setError(null);

      expect(useImpactStore.getState().error).toBe(null);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across operations', () => {
      useImpactStore.getState().setLoading(true);
      useImpactStore.getState().updateStat('meals', { current: 500 });
      useImpactStore.getState().setError('test error');

      const state = useImpactStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.stats.meals.current).toBe(500);
      expect(state.error).toBe('test error');
    });
  });

  describe('Actions Interface', () => {
    it('should expose all required actions', () => {
      const state = useImpactStore.getState();

      expect(typeof state.setStats).toBe('function');
      expect(typeof state.setHeroStories).toBe('function');
      expect(typeof state.updateStat).toBe('function');
      expect(typeof state.setLoading).toBe('function');
      expect(typeof state.setError).toBe('function');
      expect(typeof state.clearError).toBe('function');
    });
  });
});
