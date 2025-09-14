// ===================================================================
// ESEMPI DI MIGRAZIONE AI SELETTORI MEMOIZZATI
// Guida per ottimizzare i componenti esistenti
// ===================================================================

/**
 * PRIMA: Utilizzo diretto dello store (causa re-render inutili)
 *
 * import { useProjectsStore } from '../stores';
 *
 * const MyComponent = () => {
 *   const { projects, isLoading, error } = useProjectsStore();
 *   // ❌ Il componente si ri-renderizza ogni volta che QUALSIASI parte dello store cambia
 *
 *   const activeProjects = projects.filter(p => p.status === 'active');
 *   // ❌ Filtro ricreato ad ogni render
 *
 *   return (
 *     <div>
 *       {isLoading && <Spinner />}
 *       {error && <ErrorMessage error={error} />}
 *       {activeProjects.map(project => <ProjectCard key={project.id} project={project} />)}
 *     </div>
 *   );
 * };
 */

/**
 * DOPO: Utilizzo dei selettori memoizzati (performance ottimizzate)
 *
 * import {
 *   useActiveProjects,
 *   useProjectsUIState
 * } from '../stores';
 *
 * const MyComponent = () => {
 *   const activeProjects = useActiveProjects(); // ✅ Memoizzato, si aggiorna solo quando cambiano i progetti attivi
 *   const { isLoading, error } = useProjectsUIState(); // ✅ Si aggiorna solo quando cambia lo stato UI
 *
 *   return (
 *     <div>
 *       {isLoading && <Spinner />}
 *       {error && <ErrorMessage error={error} />}
 *       {activeProjects.map(project => <ProjectCard key={project.id} project={project} />)}
 *     </div>
 *   );
 * };
 */

// ===================================================================
// ESEMPI SPECIFICI PER COMPONENTI COMUNI
// ===================================================================

/**
 * ESEMPIO 1: Componente Loading Spinner
 *
 * // ❌ PRIMA
 * const LoadingSpinner = () => {
 *   const { isLoading } = useAppStore();
 *   return isLoading ? <Spinner /> : null;
 * };
 *
 * // ✅ DOPO
 * const LoadingSpinner = () => {
 *   const isLoading = useAppLoading();
 *   return isLoading ? <Spinner /> : null;
 * };
 */

/**
 * ESEMPIO 2: Componente Error Display
 *
 * // ❌ PRIMA
 * const ErrorDisplay = () => {
 *   const { error } = useAppStore();
 *   return error ? <ErrorMessage error={error} /> : null;
 * };
 *
 * // ✅ DOPO
 * const ErrorDisplay = () => {
 *   const error = useAppError();
 *   return error ? <ErrorMessage error={error} /> : null;
 * };
 */

/**
 * ESEMPIO 3: Lista Progetti Filtrata
 *
 * // ❌ PRIMA
 * const ProjectsList = ({ filter }: { filter: string }) => {
 *   const { projects } = useProjectsStore();
 *   const filteredProjects = useMemo(() => {
 *     return projects.filter(p =>
 *       p.title.toLowerCase().includes(filter.toLowerCase())
 *     );
 *   }, [projects, filter]);
 *
 *   return (
 *     <div>
 *       {filteredProjects.map(project => (
 *         <ProjectCard key={project.id} project={project} />
 *       ))}
 *     </div>
 *   );
 * };
 *
 * // ✅ DOPO
 * const ProjectsList = ({ filter }: { filter: string }) => {
 *   const filteredProjects = useFilteredProjects(filter);
 *
 *   return (
 *     <div>
 *       {filteredProjects.map(project => (
 *         <ProjectCard key={project.id} project={project} />
 *       ))}
 *     </div>
 *   );
 * };
 */

/**
 * ESEMPIO 4: Dashboard con Statistiche
 *
 * // ❌ PRIMA
 * const Dashboard = () => {
 *   const { projects } = useProjectsStore();
 *   const { stats } = useImpactStore();
 *   const { isLoading: projectsLoading } = useProjectsStore();
 *   const { isLoading: impactLoading } = useImpactStore();
 *
 *   const projectStats = useMemo(() => ({
 *     total: projects.length,
 *     active: projects.filter(p => p.status === 'active').length,
 *     completed: projects.filter(p => p.status === 'completed').length,
 *   }), [projects]);
 *
 *   const impactProgress = useMemo(() => ({
 *     meals: Math.round((stats.meals.current / stats.meals.target) * 100),
 *     volunteers: Math.round((stats.volunteers.current / stats.volunteers.target) * 100),
 *   }), [stats]);
 *
 *   const isLoading = projectsLoading || impactLoading;
 *
 *   return (
 *     <div>
 *       {isLoading && <Spinner />}
 *       <StatsCard stats={projectStats} />
 *       <ProgressCard progress={impactProgress} />
 *     </div>
 *   );
 * };
 *
 * // ✅ DOPO
 * const Dashboard = () => {
 *   const overview = useDashboardOverview();
 *
 *   return (
 *     <div>
 *       {overview.loading.isAnyLoading && <Spinner />}
 *       <StatsCard stats={overview.projects} />
 *       <ProgressCard progress={overview.impact} />
 *     </div>
 *   );
 * };
 */

/**
 * ESEMPIO 5: Componente con Azioni
 *
 * // ❌ PRIMA
 * const ProjectActions = ({ projectId }: { projectId: string }) => {
 *   const { updateProject, deleteProject, setLoading, setError } = useProjectsStore();
 *
 *   const handleUpdate = async (updates: Partial<Project>) => {
 *     setLoading(true);
 *     try {
 *       await updateProject(projectId, updates);
 *     } catch (error) {
 *       setError(error.message);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleUpdate({ status: 'completed' })}>
 *         Mark Complete
 *       </button>
 *       <button onClick={() => deleteProject(projectId)}>
 *         Delete
 *       </button>
 *     </div>
 *   );
 * };
 *
 * // ✅ DOPO
 * const ProjectActions = ({ projectId }: { projectId: string }) => {
 *   const { updateProject, deleteProject, setLoading, setError } = useProjectsActions();
 *
 *   const handleUpdate = async (updates: Partial<Project>) => {
 *     setLoading(true);
 *     try {
 *       await updateProject(projectId, updates);
 *     } catch (error) {
 *       setError(error.message);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleUpdate({ status: 'completed' })}>
 *         Mark Complete
 *       </button>
 *       <button onClick={() => deleteProject(projectId)}>
 *         Delete
 *       </button>
 *     </div>
 *   );
 * };
 */

// ===================================================================
// PATTERN DI MIGRAZIONE RACCOMANDATI
// ===================================================================

/**
 * 1. COMPONENTI CHE MOSTRANO SOLO LOADING
 *    useAppStore() → useAppLoading()
 *    useProjectsStore() → useProjectsUIState() (se serve anche error)
 *
 * 2. COMPONENTI CHE GESTISCONO ERRORI
 *    useAppStore() → useAppError() o useAppUIState()
 *
 * 3. LISTE DI PROGETTI
 *    useProjectsStore() → useActiveProjects(), useCompletedProjects(), etc.
 *
 * 4. STATISTICHE E CONTEGGI
 *    Calcoli manuali → useProjectsStats(), useImpactProgress()
 *
 * 5. COMPONENTI CON SOLO AZIONI
 *    useProjectsStore() → useProjectsActions()
 *
 * 6. DASHBOARD E OVERVIEW
 *    Multiple store calls → useDashboardOverview()
 *
 * 7. RICERCA E FILTRI
 *    Filtri manuali → useFilteredProjects(searchQuery)
 */

// ===================================================================
// BENEFICI DELLE PERFORMANCE
// ===================================================================

/**
 * ✅ RIDUZIONE RE-RENDER:
 *    - I componenti si aggiornano solo quando cambiano i dati che utilizzano
 *    - Eliminati re-render causati da cambiamenti irrilevanti dello store
 *
 * ✅ MEMOIZZAZIONE AUTOMATICA:
 *    - Calcoli complessi (filtri, statistiche) sono memoizzati
 *    - Evitati calcoli ridondanti ad ogni render
 *
 * ✅ SHALLOW COMPARISON:
 *    - Utilizzo di zustand/shallow per confronti ottimizzati
 *    - Prevenzione di re-render per oggetti con stesso contenuto
 *
 * ✅ SEPARAZIONE DELLE RESPONSABILITÀ:
 *    - Selettori specifici per dati specifici
 *    - Componenti più focalizzati e performanti
 *
 * ✅ COMPOSABILITÀ:
 *    - Selettori combinabili per casi d'uso complessi
 *    - Riutilizzo di logica di selezione tra componenti
 */

export {}; // Questo file è solo per documentazione
