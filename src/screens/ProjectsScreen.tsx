import React from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import FilterTabs from '../components/ui/FilterTabs';
import ProjectCard from '../components/ProjectCard';
import {
  ProjectsEmptyState,
  ProjectsHeader,
  ProjectsStats,
} from '../components/domain/ProjectsScreenSections';
import { useProjectsScreenLogic } from '../hooks/useProjectsScreenLogic';
import { useTheme } from '../shared/hooks/useTheme';
import { useProjectsScreenStyles } from '../styles/ProjectsScreenStyles';
import type {
  Project,
  ProjectsScreenProps,
} from '../types/ProjectsScreenTypes';

// Main Component - Now much smaller
const ProjectsScreen: React.FC<ProjectsScreenProps> = () => {
  const { colors } = useTheme();

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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectsScreen;
