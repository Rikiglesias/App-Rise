// ===================================================================
// ZUSTAND MEMOIZED SELECTORS
// Performance optimization per ridurre re-render inutili
// ===================================================================

import { useMemo } from 'react';

import { useAppStore } from './appStore';
import { useProjectsStore } from './projectsStore';
import { useImpactStore } from './impactStore';

// ===================================================================
// APP STORE SELECTORS
// ===================================================================

/**
 * Selettore per lo stato di loading dell'app
 * Ottimizzato per componenti che mostrano solo loading state
 */
export const useAppLoading = () => useAppStore(state => state.isLoading);

/**
 * Selettore per errori dell'app
 * Ottimizzato per componenti di gestione errori
 */
export const useAppError = () => useAppStore(state => state.error);

/**
 * Selettore combinato per stato UI dell'app
 * Ottimizzato per componenti che gestiscono loading + errori
 */
export const useAppUIState = () => {
  const isLoading = useAppStore(state => state.isLoading);
  const error = useAppStore(state => state.error);

  return useMemo(
    () => ({
      isLoading,
      error,
      hasError: error !== null,
    }),
    [isLoading, error]
  );
};

/**
 * Selettore per azioni dell'app store
 * Memoizzato per evitare re-render quando cambiano solo i dati
 */
export const useAppActions = () => {
  const setLoading = useAppStore(state => state.setLoading);
  const setError = useAppStore(state => state.setError);
  const clearError = useAppStore(state => state.clearError);
  const setLastUpdated = useAppStore(state => state.setLastUpdated);

  return useMemo(
    () => ({
      setLoading,
      setError,
      clearError,
      setLastUpdated,
    }),
    [setLoading, setError, clearError, setLastUpdated]
  );
};

// ===================================================================
// PROJECTS STORE SELECTORS
// ===================================================================

/**
 * Selettore per tutti i progetti
 * Base per altri selettori più specifici
 */
export const useAllProjects = () => useProjectsStore(state => state.projects);

/**
 * Selettore memoizzato per progetti attivi
 * Ottimizzato per componenti che mostrano solo progetti attivi
 */
export const useActiveProjects = () => {
  const projects = useProjectsStore(state => state.projects);
  return useMemo(
    () => projects.filter(project => project.status === 'active'),
    [projects]
  );
};

/**
 * Selettore memoizzato per progetti completati
 * Ottimizzato per sezioni di progetti completati
 */
export const useCompletedProjects = () => {
  const projects = useProjectsStore(state => state.projects);
  return useMemo(
    () => projects.filter(project => project.status === 'completed'),
    [projects]
  );
};

/**
 * Selettore memoizzato per progetti futuri
 * Ottimizzato per sezioni di progetti in arrivo
 */
export const useUpcomingProjects = () => {
  const projects = useProjectsStore(state => state.projects);
  return useMemo(
    () => projects.filter(project => project.status === 'upcoming'),
    [projects]
  );
};

/**
 * Selettore memoizzato per statistiche progetti
 * Calcola conteggi per ogni stato
 */
export const useProjectsStats = () => {
  const projects = useProjectsStore(state => state.projects);
  return useMemo(
    () => ({
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      upcoming: projects.filter(p => p.status === 'upcoming').length,
    }),
    [projects]
  );
};

/**
 * Selettore per progetto selezionato
 * Ottimizzato per modali e dettagli progetto
 */
export const useSelectedProject = () =>
  useProjectsStore(state => state.selectedProject);

/**
 * Selettore per stato UI dei progetti
 * Combina loading, errori e progetto selezionato
 */
export const useProjectsUIState = () => {
  const isLoading = useProjectsStore(state => state.isLoading);
  const error = useProjectsStore(state => state.error);
  const selectedProject = useProjectsStore(state => state.selectedProject);

  return useMemo(
    () => ({
      isLoading,
      error,
      hasError: error !== null,
      selectedProject,
      hasSelectedProject: selectedProject !== null,
    }),
    [isLoading, error, selectedProject]
  );
};

/**
 * Selettore per azioni dei progetti
 * Memoizzato per evitare re-render
 */
export const useProjectsActions = () => {
  const setProjects = useProjectsStore(state => state.setProjects);
  const addProject = useProjectsStore(state => state.addProject);
  const updateProject = useProjectsStore(state => state.updateProject);
  const deleteProject = useProjectsStore(state => state.deleteProject);
  const selectProject = useProjectsStore(state => state.selectProject);
  const setLoading = useProjectsStore(state => state.setLoading);
  const setError = useProjectsStore(state => state.setError);
  const clearError = useProjectsStore(state => state.clearError);

  return useMemo(
    () => ({
      setProjects,
      addProject,
      updateProject,
      deleteProject,
      selectProject,
      setLoading,
      setError,
      clearError,
    }),
    [
      setProjects,
      addProject,
      updateProject,
      deleteProject,
      selectProject,
      setLoading,
      setError,
      clearError,
    ]
  );
};

/**
 * Selettore memoizzato per progetti filtrati per query
 * Ottimizzato per funzionalità di ricerca
 */
export const useFilteredProjects = (searchQuery: string) => {
  const projects = useProjectsStore(state => state.projects);
  return useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter(
      project =>
        project.title.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);
};

// ===================================================================
// IMPACT STORE SELECTORS
// ===================================================================

/**
 * Selettore per tutte le statistiche di impatto
 * Base per altri selettori più specifici
 */
export const useImpactStats = () => useImpactStore(state => state.stats);

/**
 * Selettore memoizzato per statistiche pasti
 * Ottimizzato per componenti che mostrano solo dati pasti
 */
export const useMealsStats = () => useImpactStore(state => state.stats.meals);

/**
 * Selettore memoizzato per statistiche volontari
 * Ottimizzato per componenti che mostrano solo dati volontari
 */
export const useVolunteersStats = () =>
  useImpactStore(state => state.stats.volunteers);

/**
 * Selettore memoizzato per statistiche kit
 * Ottimizzato per componenti che mostrano solo dati kit
 */
export const useKitsStats = () => useImpactStore(state => state.stats.kits);

/**
 * Selettore memoizzato per percentuali di progresso
 * Calcola le percentuali per ogni categoria
 */
export const useImpactProgress = () => {
  const stats = useImpactStore(state => state.stats);
  return useMemo(
    () => ({
      meals: Math.round((stats.meals.current / stats.meals.target) * 100),
      volunteers: Math.round(
        (stats.volunteers.current / stats.volunteers.target) * 100
      ),
      kits: Math.round((stats.kits.current / stats.kits.target) * 100),
    }),
    [stats]
  );
};

/**
 * Selettore per stato UI dell'impatto
 * Combina loading ed errori
 */
export const useImpactUIState = () => {
  const isLoading = useImpactStore(state => state.isLoading);
  const error = useImpactStore(state => state.error);

  return useMemo(
    () => ({
      isLoading,
      error,
      hasError: error !== null,
    }),
    [isLoading, error]
  );
};

/**
 * Selettore per azioni dell'impatto
 * Memoizzato per evitare re-render
 */
export const useImpactActions = () => {
  const setStats = useImpactStore(state => state.setStats);
  const updateStat = useImpactStore(state => state.updateStat);
  const setLoading = useImpactStore(state => state.setLoading);
  const setError = useImpactStore(state => state.setError);
  const clearError = useImpactStore(state => state.clearError);

  return useMemo(
    () => ({
      setStats,
      updateStat,
      setLoading,
      setError,
      clearError,
    }),
    [setStats, updateStat, setLoading, setError, clearError]
  );
};

/**
 * Selettore memoizzato per totali combinati
 * Calcola somme e medie per dashboard
 */
export const useImpactTotals = () => {
  const stats = useImpactStore(state => state.stats);
  return useMemo(
    () => ({
      totalCurrent:
        stats.meals.current + stats.volunteers.current + stats.kits.current,
      totalTarget:
        stats.meals.target + stats.volunteers.target + stats.kits.target,
      averageProgress: Math.round(
        ((stats.meals.current / stats.meals.target +
          stats.volunteers.current / stats.volunteers.target +
          stats.kits.current / stats.kits.target) /
          3) *
          100
      ),
    }),
    [stats]
  );
};

// ===================================================================
// COMBINED SELECTORS
// Selettori che combinano dati da più store
// ===================================================================

/**
 * Selettore combinato per stato globale dell'app
 * Combina loading states da tutti gli store
 */
export const useGlobalLoadingState = () => {
  const appLoading = useAppStore(state => state.isLoading);
  const projectsLoading = useProjectsStore(state => state.isLoading);
  const impactLoading = useImpactStore(state => state.isLoading);

  return useMemo(
    () => ({
      isAnyLoading: appLoading || projectsLoading || impactLoading,
      loadingStates: {
        app: appLoading,
        projects: projectsLoading,
        impact: impactLoading,
      },
    }),
    [appLoading, projectsLoading, impactLoading]
  );
};

/**
 * Selettore combinato per errori globali
 * Combina errori da tutti gli store
 */
export const useGlobalErrorState = () => {
  const appError = useAppStore(state => state.error);
  const projectsError = useProjectsStore(state => state.error);
  const impactError = useImpactStore(state => state.error);

  return useMemo(
    () => ({
      hasAnyError: !!(appError ?? projectsError ?? impactError),
      errors: {
        app: appError,
        projects: projectsError,
        impact: impactError,
      },
      firstError: appError ?? projectsError ?? impactError,
    }),
    [appError, projectsError, impactError]
  );
};

/**
 * Selettore per dashboard overview
 * Combina dati chiave da tutti gli store per dashboard
 */
export const useDashboardOverview = () => {
  const projectsStats = useProjectsStats();
  const impactProgress = useImpactProgress();
  const globalLoading = useGlobalLoadingState();
  const globalErrors = useGlobalErrorState();

  return useMemo(
    () => ({
      projects: projectsStats,
      impact: impactProgress,
      loading: globalLoading,
      errors: globalErrors,
      isReady: !globalLoading.isAnyLoading && !globalErrors.hasAnyError,
    }),
    [projectsStats, impactProgress, globalLoading, globalErrors]
  );
};
