/* eslint-disable react-native/no-unused-styles */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import type { useNewActionsAnimations } from './ContributeAnimations';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // HEADER CON SPAZIO GESTITO - PATTERN UFFICIALE PAGINA AZIONI (#11)
        headerContainer: {
          paddingTop: Spacing[3], // COMPATTO per header azioni
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[6], // AUMENTATO: più spazio sotto il titolo principale
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

        // CONTAINER ELEGANTE COLORATO COME PAGINA AZIONI
        mainHeaderContainer: {
          alignItems: 'center',
          backgroundColor: 'rgba(31, 41, 55, 0.03)', // BACKGROUND COLORATO ELEGANTE
          paddingVertical: Spacing[3], // COME PAGINA AZIONI
          paddingHorizontal: Spacing[5], // COME PAGINA AZIONI
          borderRadius: 16, // MODERNO COME PAGINA AZIONI
          borderWidth: 1,
          borderColor: 'rgba(31, 41, 55, 0.08)', // BORDO GRIGIO SOTTILE
          shadowColor: '#1F2937', // OMBRA GRIGIA COORDINATA
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },

        // TIPOGRAFIA POTENTE E MODERNA - INGRANDITA
        titleText: {
          fontSize: Typography.sizes['4xl'], // INGRANDITO: da 3xl a 4xl per maggiore impatto
          fontWeight: Typography.weights.black, // MASSIMO peso per autorità
          color: '#1F2937', // NERO per contrasto
          textAlign: 'center',
          letterSpacing: -1.2, // LEGGERMENTE AUMENTATO per bilanciare la dimensione
          lineHeight: 42, // AUMENTATO per proporzioni
          marginBottom: Spacing[2], // SPAZIO per separazione
          textShadowColor: 'rgba(31, 41, 55, 0.15)', // OMBRA SOTTILE
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
          marginTop: Spacing[1], // SPACING COORDINATO
          opacity: 0.8, // TRASPARENZA ELEGANTE
        },

        descriptionText: {
          fontSize: Typography.sizes.base, // BASE per leggibilità
          fontWeight: Typography.weights.medium, // MEDIUM per equilibrio
          color: Colors.neutral[600], // GRIGIO PIÙ CHIARO per gerarchia
          textAlign: 'center',
          lineHeight: 24, // RESPIRO per leggibilità
          marginBottom: Spacing[5], // MAGGIORE STACCO per separazione
          fontStyle: 'normal', // PULITO senza italic
          backgroundColor: Colors.neutral[50], // GRIGIO NEUTRO per card
          paddingVertical: Spacing[3], // RESPIRO per comfort
          paddingHorizontal: Spacing[5], // AMPIO per eleganza
          borderRadius: 16, // MODERNO per armonia
          borderWidth: 1,
          borderColor: Colors.neutral[200], // BORDO NEUTRO
          // OMBRA NEUTRA E SOTTILE
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 2,
        },
      }),
    []
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

      {/* HEADER INTEGRATO PRINCIPALE */}
      <View style={styles.mainHeaderContainer}>
        <Text style={styles.titleText}>
          Fai la{'\n'}
          <Text style={styles.titleAccent}>Differenza</Text>
        </Text>
        <Text style={styles.mainSubtitle}>
          Ogni azione conta nella lotta contro la fame
        </Text>
      </View>
    </Animated.View>
  );
};

export default NewActionsHeader;
