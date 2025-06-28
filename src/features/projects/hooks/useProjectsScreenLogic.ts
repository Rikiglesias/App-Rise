import { useCallback, useMemo, useState } from 'react';
import {
  createProjectTabs,
  getSectionTitleByTab,
} from '../data/ProjectsScreenData';
import { useProjectsData } from '../../../shared/hooks/useProjectsData';
import type {
  Project,
  ProjectsScreenLogicReturn,
} from '../types/ProjectsScreenTypes';

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

  const handleProjectPress = useCallback((_projectId: string) => {
    // Navigation logic here - removed console.log for no-console
    // TODO: Implement navigation to project detail
  }, []);

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
  };
};
