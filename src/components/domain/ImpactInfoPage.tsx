import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import {
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

interface ImpactInfoPageProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ImpactInfoPage: React.FC<ImpactInfoPageProps> = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <MaterialCommunityIcons
          name={icon}
          size={48}
          color={Colors.primary[600]}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing[5],
    backgroundColor: Colors.neutral[50],
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginTop: Spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing[2],
  },
});

export default ImpactInfoPage;
