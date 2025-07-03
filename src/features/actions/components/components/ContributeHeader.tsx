/* eslint-disable react-native/no-unused-styles */
// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { FormattedText } from '../../../../components/ui';

import { LinearGradient } from 'expo-linear-gradient';

import { TypographyTokens } from '../../../../shared/constants/responsiveSystem';
import { Spacing, Typography } from '../../../../shared/constants';

import type { useNewActionsAnimations } from './ContributeAnimations';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // HEADER CON SPAZIO UNIFORMATO CON PAGINA IMPATTO
        headerContainer: {
          paddingTop: Spacing[8], // UNIFORMATO: stesso paddingTop di "Il Nostro Impatto" (32px)
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[6], // UNIFORMATO: stesso paddingBottom di "Il Nostro Impatto"
          alignItems: 'center',
          position: 'relative',
        },

        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: Platform.OS === 'android' ? 0.01 : 0.02, // ANDROID: opacity ancora più bassa per evitare conflitti
        },

        // CONTAINER ELEGANTE COLORATO - UNIFORMATO CON PAGINA IMPATTO
        mainHeaderContainer: {
          alignItems: 'center',
          backgroundColor:
            Platform.OS === 'android'
              ? '#F5F6F6' // ANDROID: Stesso grigio di "Il Nostro Impatto"
              : 'rgba(31, 41, 55, 0.03)', // iOS: Stesso rgba di "Il Nostro Impatto"
          paddingHorizontal: Spacing[4],
          paddingTop: Spacing[3],
          paddingBottom: Spacing[3],
          borderRadius: 16,
          borderWidth: 1, // UNIFORMATO: stesso spessore di "Il Nostro Impatto"
          borderColor:
            Platform.OS === 'android'
              ? '#E8EAEB' // ANDROID: Stesso bordo di "Il Nostro Impatto"
              : 'rgba(31, 41, 55, 0.08)', // iOS: Stesso rgba di "Il Nostro Impatto"
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // Solo ombra diversa per stabilità
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 1 : 3, // Solo elevation diversa per stabilità
        },

        // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
        titleText: {
          // fontSize rimosso - ora gestito da Text
          fontWeight: Typography.weights.black, // MASSIMO peso per autorità - IDENTICO A IMPATTO
          color: '#1F2937',
          textAlign: 'center',
          letterSpacing: -1.2, // IDENTICO A IMPATTO per coerenza
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
          fontSize: TypographyTokens.styles.body.medium, // INGRANDITO: da sm a base per maggiore leggibilità
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
      <FormattedText variant="display-small" style={styles.titleText}>
        Fai la{'\n'}
        <FormattedText variant="display-small" style={styles.titleAccent}>
          Differenza
        </FormattedText>
      </FormattedText>
      <FormattedText variant="body-medium" style={styles.mainSubtitle}>
        Ogni azione conta nella lotta contro la fame
      </FormattedText>
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

      {/* HEADER INTEGRATO PRINCIPALE - UNIFORMATO CON PAGINA IMPATTO */}
      <View style={styles.mainHeaderContainer}>{titleContent}</View>
    </Animated.View>
  );
};

export default NewActionsHeader;
