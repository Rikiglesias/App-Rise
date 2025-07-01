import React from 'react';
import { View, StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { FormattedText } from '../../../../components/ui';
import {
  Typography,
  Spacing,
  Colors,
} from '../../../../shared/constants/designTokens';
import { useIntelligentFontScaling } from '../../../../shared/hooks';

export const ActionDescription: React.FC = () => {
  const { scaleFont } = useIntelligentFontScaling();

  return (
    <View style={styles.descriptionContainer}>
      <LinearGradient
        colors={['#F3F4F6', '#E5E7EB', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.descriptionGradient}
      >
        <View style={styles.descriptionContent}>
          <FormattedText
            variant="title-medium"
            style={[styles.descriptionMain, { fontSize: scaleFont(20) }]}
          >
            Unisciti a noi nella lotta contro la fame nel mondo
          </FormattedText>
          <View style={styles.descriptionDivider} />
          <FormattedText
            variant="body-large"
            style={[styles.descriptionSecondary, { fontSize: scaleFont(17) }]}
          >
            Ogni azione conta per cambiare vite
          </FormattedText>
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
    // fontSize moved to dynamic scaleFont(20) - responsive scaling
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center' as const,
    letterSpacing: -0.3,
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
    // fontSize moved to dynamic scaleFont(17) - responsive scaling
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(107, 114, 128, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
