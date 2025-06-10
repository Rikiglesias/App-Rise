import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';

import FilterTabs from '../components/FilterTabs';
import ProjectCard from '../components/ProjectCard';
import SectionContainer from '../components/SectionContainer';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useProjectsData } from '../hooks/useProjectsData';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';

type ProjectsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Progetti'
>;

interface Props {
  navigation: ProjectsScreenNavigationProp;
}

const ProjectsScreen: React.FC<Props> = () => {
  const { colors } = useTheme();
  const {
    projects,
    getActiveProjects,
    getCompletedProjects,
    getUpcomingProjects,
    getProjectStats,
  } = useProjectsData();

  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const stats = getProjectStats();

  const tabs = [
    {
      id: 'all',
      label: 'Tutti',
      count: stats.total,
      icon: '📋',
    },
    {
      id: 'active',
      label: 'In Corso',
      count: stats.active,
      icon: '🚀',
    },
    {
      id: 'completed',
      label: 'Completati',
      count: stats.completed,
      icon: '✅',
    },
    {
      id: 'upcoming',
      label: 'Prossimi',
      count: stats.upcoming,
      icon: '⏳',
    },
  ];

  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'active':
        return getActiveProjects();
      case 'completed':
        return getCompletedProjects();
      case 'upcoming':
        return getUpcomingProjects();
      default:
        return projects;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulazione refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleProjectPress = (projectId: string) => {
    // Implementazione navigazione al dettaglio progetto
    // Per ora mostra un alert con le informazioni del progetto
    const project = projects.find(p => p.id === projectId);
    if (project) {
      Alert.alert(
        project.title,
        `Località: ${project.location}\n\nDescrizione: ${project.description}\n\nImpatto: ${project.impact}`,
        [{ text: 'Chiudi', style: 'default' }]
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary[500],
      paddingTop: Spacing[8],
      paddingBottom: Spacing[6],
      paddingHorizontal: Spacing[6],
    },
    headerTitle: {
      fontSize: Typography.sizes['3xl'],
      fontWeight: Typography.weights.extrabold,
      color: colors.neutral[0],
      textAlign: 'center',
      marginBottom: Spacing[2],
    },
    headerSubtitle: {
      fontSize: Typography.sizes.base,
      color: colors.primary[100],
      textAlign: 'center',
      lineHeight: Typography.sizes.base * 1.4,
    },
    statsSurface: {
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.neutral[0],
      padding: Spacing[6],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: colors.neutral[100],
    },
    statsTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[4],
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.primary[600],
      marginBottom: Spacing[1],
    },
    statLabel: {
      fontSize: Typography.sizes.xs,
      color: colors.neutral[600],
      textAlign: 'center',
      fontWeight: Typography.weights.medium,
    },
    content: {
      paddingHorizontal: Spacing[4],
      paddingBottom: Spacing[8],
    },
    sectionTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: Spacing[2],
      paddingHorizontal: Spacing[2],
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing[8],
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: Spacing[4],
    },
    emptyStateText: {
      fontSize: Typography.sizes.base,
      color: colors.neutral[600],
      textAlign: 'center',
    },
  });

  const filteredProjects = getFilteredProjects();

  // Helper function to get section title based on active tab
  const getSectionTitle = () => {
    switch (activeTab) {
      case 'all':
        return 'Tutti i Progetti';
      case 'active':
        return 'Progetti in Corso';
      case 'completed':
        return 'Progetti Completati';
      case 'upcoming':
        return 'Progetti Prossimi';
      default:
        return 'Progetti';
    }
  };

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>I Nostri Progetti</Text>
          <Text style={styles.headerSubtitle}>
            Scopri dove stiamo facendo la differenza nel mondo{'\n'}
            contro la fame e la malnutrizione
          </Text>
        </View>

        {/* Stats Section */}
        <SectionContainer spacing="standard">
          <Surface style={styles.statsSurface} elevation={1}>
            <Text style={styles.statsTitle}>Progetti in Numeri</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Progetti{'\n'}Totali</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>In Corso{'\n'}Attualmente</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(stats.totalBeneficiaries / 1000).toFixed(0)}K+
                </Text>
                <Text style={styles.statLabel}>Persone{'\n'}Aiutate</Text>
              </View>
            </View>
          </Surface>
        </SectionContainer>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
          showCounts={true}
        />

        {/* Projects List */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                title={project.title}
                location={project.location}
                description={project.description}
                impact={project.impact}
                status={project.status}
                progress={project.progress || undefined}
                onPress={() => handleProjectPress(project.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateText}>
                Nessun progetto trovato per questa categoria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectsScreen;
