import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { PerfectText } from '../../../components/ui';
import { Spacing, Typography } from '../../../shared/constants/designTokens';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

/**
 * Header della schermata Impact con titolo animato e gradient background
 */
export const ImpactHeader: React.FC<Props> = ({ animations }) => {
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
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']}
        style={styles.backgroundPattern}
      />

      <View style={styles.mainHeaderContainer}>
        <View style={styles.titleContainer}>
          <PerfectText size={40} lines={1} style={styles.titleText}>
            Il Nostro
          </PerfectText>
          <PerfectText size={40} lines={1} style={styles.titleAccent}>
            Impatto
          </PerfectText>
        </View>
        <PerfectText size={16} lines={2} style={styles.mainSubtitle}>
          Risultati concreti nella lotta contro la fame mondiale
        </PerfectText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Header - IDENTICO PAGINA AZIONI
  headerContainer: {
    paddingTop: Spacing[8], // AUMENTATO: da Spacing[3] a Spacing[8] per abbassare e non tagliare il titolo
    paddingHorizontal: Spacing[2], // RIDOTTO: da Spacing[4] a Spacing[2] per dare più spazio al mainHeaderContainer
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F5F6F6' // ANDROID: Grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.03)', // iOS: Mantiene rgba originale
    paddingVertical: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] per dare più spazio verticale al container
    paddingHorizontal: Spacing[6], // AUMENTATO: da Spacing[5] a Spacing[6] per evitare taglio testo
    borderRadius: 16, // MODERNO COME PAGINA AZIONI
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E8EAEB' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#1F2937', // OMBRA GRIGIA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  // CONTAINER TITOLO - IMPAGINAZIONE ELEGANTE
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3], // SPAZIO tra titolo e subtitle
  },
  // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
  titleText: {
    fontWeight: Typography.weights.black, // RIPRISTINATO: black (900) per massimo grassetto come richiesto
    color: '#1F2937', // NERO per contrasto come richiesto
    textAlign: 'center',
    letterSpacing: -0.8, // RIDOTTO: per bilanciare la dimensione ridotta (era -1.2)
    lineHeight: 45, // RIDOTTO: da 50 a 45 per proporzioni migliori con fontSize 40
    textShadowColor: 'rgba(31, 41, 55, 0.15)', // OMBRA SOTTILE
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  // ACCENTO ROSSO STRATEGICO - IDENTICO A titleText tranne colore
  titleAccent: {
    fontWeight: Typography.weights.black, // IDENTICO: black (900) per consistenza
    color: '#DC2626', // ROSSO BRAND per accento
    textAlign: 'center', // IDENTICO: per allineamento
    letterSpacing: -0.8, // IDENTICO: per spaziatura caratteri
    lineHeight: 45, // IDENTICO: per altezza linea - ridotto per proporzioni migliori
    textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false, // IDENTICO: per padding font
  },
  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitle: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.medium, // MEDIUM COME PAGINA AZIONI
    color: '#374151', // GRIGIO COORDINATO COME PAGINA AZIONI
    textAlign: 'center',
    letterSpacing: 0.2, // RIDOTTO PER ELEGANZA
    marginTop: Spacing[1], // SPACING COORDINATO
    opacity: 0.8, // TRASPARENZA ELEGANTE
  },
});
