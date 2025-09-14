// ===================================================================
// 🏠 HOME FEATURE - ENTRA IN AZIONE COMPONENT
// ===================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PerfectText } from '../../../components/ui';
import type { EntraInAzioneProps } from '../types/HomeScreenTypes';
import { ActionCTAButtons } from './EntraInAzione/ActionCTAButtons';

import { Spacing, Typography } from '@shared/constants/designTokens';

/**
 * EntraInAzione Component
 * Componente per la sezione "Entra in Azione" della home con titolo e CTA
 */
export const EntraInAzione: React.FC<EntraInAzioneProps> = ({
  navigation: _navigation,
}) => {
  return (
    <View style={styles.container}>
      {/* Container principale con sfondo distintivo */}
      <View style={styles.contentContainer}>
        {/* Titolo principale con emoji saetta */}
        <View style={styles.titleSection}>
          <PerfectText
            size={32}
            fontWeight="900"
            lines={1}
            style={styles.mainTitle}
            immunity={true}
          >
            ⚡ Entra in Azione
          </PerfectText>
        </View>

        {/* Testo descrittivo elegante */}
        <View style={styles.textSection}>
          <View style={styles.textContainer}>
            <PerfectText
              size={18}
              fontWeight="700"
              lines={2}
              style={styles.primaryMessage}
              immunity={true}
            >
              Unisciti a noi contro la fame nel mondo
            </PerfectText>
            <View style={styles.separator} />
            <PerfectText
              size={15}
              fontWeight="500"
              lines={2}
              style={styles.secondaryMessage}
              immunity={true}
            >
              Ogni azione conta per cambiare vite
            </PerfectText>
          </View>
        </View>

        {/* Bottoni CTA */}
        <ActionCTAButtons />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[6],
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[6],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  titleSection: {
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
    alignItems: 'center',
    paddingBottom: Spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    width: '100%',
  },
  mainTitle: {
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(220, 38, 38, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textSection: {
    marginBottom: Spacing[6],
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    minHeight: 120,
  },
  primaryMessage: {
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  separator: {
    width: 40,
    height: 2,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
    marginVertical: Spacing[3],
  },
  secondaryMessage: {
    color: '#059669',
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    letterSpacing: 0.1,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default EntraInAzione;
