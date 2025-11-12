import { useCallback, useMemo, useState } from 'react';
import { createProjectTabs, getSectionTitleByTab } from './ProjectsScreenData';
import type { Project, ProjectsScreenLogicReturn } from './ProjectsScreenTypes';
import { useProjectsData } from '@/shared/hooks/useProjectsData';

// Custom Hook for Projects Screen Logic
export const useProjectsScreenLogic = (): ProjectsScreenLogicReturn => {
  const {
    projects,
    getActiveProjects: _getActiveProjects,
    getCompletedProjects: _getCompletedProjects,
    getUpcomingProjects: _getUpcomingProjects,
    getProjectStats,
  } = useProjectsData();

  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailVisible, setIsProjectDetailVisible] = useState(false);

  const stats = getProjectStats();

  const tabs = useMemo(() => createProjectTabs(stats), [stats]);

  const getFilteredProjects = useCallback(() => {
    switch (activeTab) {
      case 'active':
        return projects.filter(
          (project: Project) => project.status === 'active'
        );
      case 'completed':
        return projects.filter(
          (project: Project) => project.status === 'completed'
        );
      case 'upcoming':
        return projects.filter(
          (project: Project) => project.status === 'upcoming'
        );
      default:
        return projects;
    }
  }, [activeTab, projects]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleProjectPress = useCallback(
    (projectId: string) => {
      const project = projects.find((p: Project) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        setIsProjectDetailVisible(true);
      }
    },
    [projects]
  );

  const createProjectPressHandler = useCallback(
    (projectId: string) => {
      return () => {
        handleProjectPress(projectId);
      };
    },
    [handleProjectPress]
  );

  const getSectionTitle = useCallback(() => {
    return getSectionTitleByTab(activeTab);
  }, [activeTab]);

  const handleCloseProjectDetail = useCallback(() => {
    setIsProjectDetailVisible(false);
    setSelectedProject(null);
  }, []);

  return {
    projects,
    activeTab,
    setActiveTab,
    refreshing,
    stats,
    tabs,
    filteredProjects: getFilteredProjects(),
    handleRefresh,
    createProjectPressHandler,
    getSectionTitle,
    // Project Detail Modal
    selectedProject,
    isProjectDetailVisible,
    handleCloseProjectDetail,
  };
};
