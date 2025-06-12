import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Project, ProjectsState } from './types';

// Mock data iniziali
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Scuola Primaria Nairobi',
    location: 'Nairobi, Kenya',
    description:
      "Fornitura di pasti scolastici per 500 bambini della scuola primaria di Kibera, il più grande slum urbano dell'Africa.",
    impact: "12.000 bambini nutriti quest'anno",
    status: 'active',
    progress: 75,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
  },
  {
    id: '2',
    title: 'Comunità Bangladesh',
    location: 'Dhaka, Bangladesh',
    description:
      'Programma di supporto alimentare per famiglie in difficoltà nelle aree rurali del Bangladesh.',
    impact: '8.500 famiglie supportate',
    status: 'completed',
    progress: 100,
    createdAt: '2024-02-01',
    updatedAt: '2024-11-30',
  },
  {
    id: '3',
    title: 'Centro Distribuzione Haiti',
    location: 'Port-au-Prince, Haiti',
    description:
      'Costruzione di un nuovo centro di distribuzione alimentare per raggiungere le comunità più remote.',
    impact: '15.000 persone raggiunte',
    status: 'upcoming',
    progress: 25,
    createdAt: '2024-03-10',
    updatedAt: '2024-12-15',
  },
];

export const useProjectsStore = create<ProjectsState>()(
  devtools(
    set => ({
      // State
      projects: INITIAL_PROJECTS,
      selectedProject: null,
      isLoading: false,
      error: null,

      // Actions
      setProjects: (projects: Project[]) =>
        set({ projects }, false, 'projects/setProjects'),

      addProject: (project: Project) =>
        set(
          state => ({
            projects: [...state.projects, project],
          }),
          false,
          'projects/addProject'
        ),

      updateProject: (id: string, updates: Partial<Project>) =>
        set(
          state => ({
            projects: state.projects.map(project =>
              project.id === id
                ? {
                    ...project,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  }
                : project
            ),
          }),
          false,
          'projects/updateProject'
        ),

      deleteProject: (id: string) =>
        set(
          state => ({
            projects: state.projects.filter(project => project.id !== id),
            selectedProject:
              state.selectedProject?.id === id ? null : state.selectedProject,
          }),
          false,
          'projects/deleteProject'
        ),

      selectProject: (project: Project | null) =>
        set({ selectedProject: project }, false, 'projects/selectProject'),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }, false, 'projects/setLoading'),

      setError: (error: string | null) =>
        set({ error }, false, 'projects/setError'),

      clearError: () => set({ error: null }, false, 'projects/clearError'),
    }),
    {
      name: 'projects-store',
    }
  )
);
