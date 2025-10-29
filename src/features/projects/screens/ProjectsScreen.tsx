import React from 'react';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProjectsScreenLogic } from '../hooks/useProjectsScreenLogic';
import { useProjectsScreenStyles } from '../styles/ProjectsScreenStyles';
import type {
  Project,
  ProjectsScreenProps,
} from '../types/ProjectsScreenTypes';

import { PlatformScrollView, PerfectText } from '@/components';
import FilterTabs from '@/components/ui/FilterTabs';
import ProjectCard from '@/components/ProjectCard';
import { ProjectDetailModal } from '@/components/layout';
import {
  ProjectsEmptyState,
  ProjectsHeader,
  ProjectsStats,
} from '@/components/domain/ProjectsScreenSections';

// Main Component - Now much smaller
const ProjectsScreenComponent: React.FC<ProjectsScreenProps> = () => {
  const {
    activeTab,
    setActiveTab,
    refreshing,
    stats,
    tabs,
    filteredProjects,
    handleRefresh,
    createProjectPressHandler,
    getSectionTitle,
    selectedProject,
    isProjectDetailVisible,
    handleCloseProjectDetail,
  } = useProjectsScreenLogic();

  const styles = useProjectsScreenStyles();

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
          />
        }
      >
        {/* Header */}
        <ProjectsHeader styles={styles} />

        {/* Stats Section */}
        <ProjectsStats stats={stats} styles={styles} />

        {/* Filter Tabs */}
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
          showCounts
        />

        {/* Projects List */}
        <View style={styles.content}>
          <PerfectText
            size={18}
            lines={1}
            fontWeight="400"
            style={styles.sectionTitle}
          >
            {getSectionTitle()}
          </PerfectText>

          {filteredProjects.length > 0 ? (
            filteredProjects.map((project: Project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                location={project.location}
                description={project.description}
                impact={project.impact}
                status={project.status}
                progress={project.progress ?? undefined}
                onPress={createProjectPressHandler(project.id)}
              />
            ))
          ) : (
            <ProjectsEmptyState styles={styles} />
          )}
        </View>
      </PlatformScrollView>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        visible={isProjectDetailVisible}
        location={
          selectedProject
            ? {
                id: selectedProject.id,
                name: selectedProject.title,
                country: selectedProject.location,
                coordinates: { latitude: 0, longitude: 0 }, // Default coordinates
                projects: 1,
                beneficiaries: selectedProject.impact,
                status: selectedProject.status,
                description: selectedProject.description,
                image:
                  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
              }
            : null
        }
        onClose={handleCloseProjectDetail}
      />
    </SafeAreaView>
  );
};

const ProjectsScreen = React.memo(ProjectsScreenComponent);

export default ProjectsScreen;

// Named export per compatibilità barrel exports
export { ProjectsScreen };
