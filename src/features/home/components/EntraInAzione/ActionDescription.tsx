import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Typography,
  Spacing,
  Colors,
} from '../../../../shared/constants/designTokens';

export const ActionDescription: React.FC = () => {
  return (
    <View style={styles.descriptionContainer}>
      <LinearGradient
        colors={['#F3F4F6', '#E5E7EB', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.descriptionGradient}
      >
        <View style={styles.descriptionContent}>
          <Text style={styles.descriptionMain}>
            Unisciti a noi nella lotta contro la fame nel mondo
          </Text>
          <View style={styles.descriptionDivider} />
          <Text style={styles.descriptionSecondary}>
            Ogni azione conta per cambiare vite
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  descriptionContainer: {
    marginTop: Spacing[5],
    marginBottom: Spacing[3],
    marginHorizontal: Spacing[3],
  },

  descriptionGradient: {
    borderRadius: 20,
    padding: 2,
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  descriptionContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18,
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  descriptionMain: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center' as const,
    letterSpacing: -0.3,
    lineHeight: Typography.sizes.xl * 1.3,
    textShadowColor: 'rgba(31, 41, 55, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  descriptionDivider: {
    height: 2,
    width: 40,
    backgroundColor: '#DC2626',
    borderRadius: 1,
    marginVertical: Spacing[3],
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  descriptionSecondary: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    lineHeight: Typography.sizes.lg * 1.4,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(107, 114, 128, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
