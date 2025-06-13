/**
 * 🎮 MICROINTERACTIONS SHOWCASE
 * Demo del nuovo sistema di microinterazioni 2025
 */

import React, { useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EnhancedButton } from '../components/enhanced/EnhancedButton';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useTheme } from '../shared/hooks/useTheme';

// ===================================================================
// COMPONENTE PRINCIPALE
// ===================================================================

export const MicroInteractionsShowcase: React.FC = () => {
  const { colors } = useTheme();

  const handleButtonPress = useCallback((variant: string) => {
    Alert.alert('🎉 Interazione!', `Hai premuto il button ${variant}!`);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.neutral[50] }]}
    >
      <View style={[styles.header, { backgroundColor: colors.primary[500] }]}>
        <Text style={styles.headerTitle}>🚀 Microinterazioni 2025</Text>
        <Text style={styles.headerSubtitle}>
          Sistema avanzato di interazioni fluide
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>
            🌟 Enhanced Buttons
          </Text>

          <View style={styles.buttonGrid}>
            <EnhancedButton
              title="Primary"
              variant="primary"
              onPress={() => handleButtonPress('Primary')}
              icon="✨"
            />

            <EnhancedButton
              title="Secondary"
              variant="secondary"
              onPress={() => handleButtonPress('Secondary')}
              icon="🔮"
            />

            <EnhancedButton
              title="Success"
              variant="success"
              onPress={() => handleButtonPress('Success')}
              icon="✅"
            />

            <EnhancedButton
              title="Error"
              variant="error"
              onPress={() => handleButtonPress('Error')}
              icon="❌"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>
            ℹ️ Caratteristiche
          </Text>

          <View
            style={[styles.infoCard, { backgroundColor: colors.neutral[0] }]}
          >
            <Text style={styles.infoTitle}>🎯 Microinterazioni Fluide</Text>
            <Text style={styles.infoText}>
              Ogni tocco attiva animazioni realistiche con feedback haptic
              sincronizzato
            </Text>
          </View>

          <View
            style={[styles.infoCard, { backgroundColor: colors.neutral[0] }]}
          >
            <Text style={styles.infoTitle}>⚡ Performance 60fps+</Text>
            <Text style={styles.infoText}>
              Animazioni ottimizzate per performance fluide su tutti i
              dispositivi
            </Text>
          </View>

          <View
            style={[styles.infoCard, { backgroundColor: colors.neutral[0] }]}
          >
            <Text style={styles.infoTitle}>♿ Accessibilità AAA</Text>
            <Text style={styles.infoText}>
              Supporto completo per screen reader e navigation da tastiera
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.neutral[600] }]}>
            ✨ Prova a toccare i button per sperimentare le microinterazioni!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===================================================================
// STILI
// ===================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[100],
    textAlign: 'center',
    marginTop: Spacing[1],
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingVertical: Spacing[4],
  },

  section: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[6],
  },

  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[4],
  },

  buttonGrid: {
    gap: Spacing[3],
  },

  infoCard: {
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  infoTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },

  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed,
  },

  footer: {
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  footerText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MicroInteractionsShowcase;
