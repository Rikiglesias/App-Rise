/* eslint-disable react-native/no-unused-styles */
// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Spacing, Typography } from '../../../shared/constants/designTokens';

import type { useNewActionsAnimations } from './ContributeAnimations';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // HEADER CON SPAZIO ANDROID OTTIMIZZATO
        headerContainer: {
          paddingTop: Platform.OS === 'android' ? Spacing[12] : Spacing[1], // AUMENTATO: più spazio da status bar Android
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[4], // AUMENTATO: più equilibrio generale
          alignItems: 'center',
          position: 'relative',
        },

        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02, // RIDOTTO per sottilità
        },

        // CONTAINER ELEGANTE - DIMENSIONI OTTIMIZZATE
        mainHeaderContainer: {
          alignItems: 'center',
          backgroundColor:
            Platform.OS === 'android' ? '#F8F9FA' : 'rgba(31, 41, 55, 0.03)',
          paddingHorizontal: Spacing[4], // RIDOTTO: spazio laterale più contenuto
          paddingTop: Platform.OS === 'android' ? Spacing[4] : Spacing[2], // DRASTICAMENTE RIDOTTO: contenuto su entrambe le piattaforme
          paddingBottom: Spacing[3], // AUMENTATO: equilibrio tra sopra e sotto
          borderRadius: 16,
          borderWidth: 1,
          borderColor:
            Platform.OS === 'android' ? '#E9ECEF' : 'rgba(31, 41, 55, 0.08)',
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },

        // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
        titleText: {
          fontSize: Typography.sizes['3xl'], // RIDIMENSIONATO: da 4xl a 3xl per migliore proporzione
          fontWeight: Typography.weights.bold, // RIDOTTO: da black a bold per migliore leggibilità
          color: '#1F2937',
          textAlign: 'center',
          letterSpacing: -0.8, // RIDOTTO: spacing più naturale
          lineHeight: 42, // AUMENTATO: da 30 a 42 per respirare meglio
          marginBottom: Spacing[1], // AGGIUNTO: piccolo spazio sotto per equilibrio
          textShadowColor: 'rgba(31, 41, 55, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          includeFontPadding: false,
        },

        // ACCENTO ROSSO STRATEGICO
        titleAccent: {
          color: '#DC2626', // ROSSO BRAND per accento
          textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        },

        // SUBTITLE INLINE INGRANDITO E ELEGANTE
        mainSubtitle: {
          fontSize: Typography.sizes.base, // INGRANDITO: da sm a base per maggiore leggibilità
          fontWeight: Typography.weights.medium, // MEDIUM COME PAGINA AZIONI
          color: '#374151', // GRIGIO COORDINATO COME PAGINA AZIONI
          textAlign: 'center',
          letterSpacing: 0.2, // RIDOTTO PER ELEGANZA
          marginTop: 0, // ZERO: attaccato al titolo
          opacity: 0.8, // TRASPARENZA ELEGANTE
        },
      }),
    []
  );

  // CONTENUTO TITOLO
  const titleContent = (
    <>
      <Text style={styles.titleText}>
        Fai la{'\n'}
        <Text style={styles.titleAccent}>Differenza</Text>
      </Text>
      <Text style={styles.mainSubtitle}>
        Ogni azione conta nella lotta contro la fame
      </Text>
    </>
  );

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']} // NEUTRO per non disturbare
        style={styles.backgroundPattern}
      />

      {/* HEADER INTEGRATO PRINCIPALE - STESSI COLORI IPHONE */}
      <View style={styles.mainHeaderContainer}>{titleContent}</View>
    </Animated.View>
  );
};

export default NewActionsHeader;
