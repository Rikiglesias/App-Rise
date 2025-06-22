import React from 'react';
import { RefreshControl, SafeAreaView, Text, View } from 'react-native';
import { PlatformScrollView } from '../components/ui';

import FilterTabs from '../components/ui/FilterTabs';
import ProjectCard from '../components/ProjectCard';
import {
  ProjectsEmptyState,
  ProjectsHeader,
  ProjectsStats,
} from '../components/domain/ProjectsScreenSections';
import { useProjectsScreenLogic } from '../hooks/useProjectsScreenLogic';
import { useProjectsScreenStyles } from '../styles/ProjectsScreenStyles';
import type {
  Project,
  ProjectsScreenProps,
} from '../types/ProjectsScreenTypes';

// Main Component - Now much smaller
const ProjectsScreen: React.FC<ProjectsScreenProps> = () => {
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
          <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

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
    </SafeAreaView>
  );
};

export default ProjectsScreen;
