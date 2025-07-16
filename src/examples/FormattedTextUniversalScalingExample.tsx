import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';
import { Colors, Spacing } from '../shared/constants/designTokens';

/**
 * ESEMPIO: SISTEMA BI-DIREZIONALE INTELLIGENTE
 *
 * Dimostra il nuovo sistema intelligentAccessibilityScaling che:
 * - Calcola fontSize ottimale per ogni dispositivo
 * - Supporta zoom accessibilità fino ai limiti calcolati
 * - Funziona bi-direzionalmente: riduce su piccoli, ingrandisce su grandi
 * - Garantisce sempre rispetto di fixedLines
 */
export const FormattedTextUniversalScalingExample: React.FC = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing[4],
      backgroundColor: Colors.neutral[0],
    },
    section: {
      marginBottom: Spacing[6],
      padding: Spacing[4],
      borderRadius: 12,
      backgroundColor: Colors.neutral[50],
    },
    title: {
      marginBottom: Spacing[3],
      color: Colors.primary[600],
      fontWeight: 'bold',
    },
    example: {
      marginBottom: Spacing[2],
      padding: Spacing[3],
      backgroundColor: Colors.neutral[100],
      borderRadius: 8,
    },
    description: {
      color: Colors.neutral[600],
      fontStyle: 'italic',
    },
    label: {
      color: Colors.neutral[800],
      fontWeight: '600',
      marginBottom: Spacing[2],
    },
    summarySection: {
      marginTop: Spacing[6],
      padding: Spacing[4],
      backgroundColor: Colors.primary[50],
      borderRadius: 12,
    },
    summaryTitle: {
      color: Colors.primary[700],
      marginBottom: Spacing[3],
    },
    summaryText: {
      color: Colors.primary[800],
    },
    warningSection: {
      marginTop: Spacing[4],
      padding: Spacing[4],
      backgroundColor: Colors.neutral[100],
      borderRadius: 12,
    },
    warningTitle: {
      color: Colors.neutral[700],
      marginBottom: Spacing[3],
    },
    warningText: {
      color: Colors.neutral[800],
    },
  });

  return (
    <View style={styles.container}>
      <FormattedText fontSize={28} style={styles.title}>
        🔄 Sistema Bi-Direzionale Intelligente
      </FormattedText>

      {/* CASO 1: Titolo con sistema bi-direzionale */}
      <View style={styles.section}>
        <FormattedText fontSize={14} style={styles.label}>
          CASO 1: Titolo Principale - Sistema Bi-Direzionale
        </FormattedText>

        <View style={styles.example}>
          <FormattedText
            fontSize={32}
            intelligentAccessibilityScaling={true}
            fixed={true}
            fixedLines={1}
            fontWeight="bold"
          >
            Rise Against Hunger Italia
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.description}>
          ✅ Sistema bi-direzionale: iPhone SE 26px, iPhone 15 32px, iPad 42px,
          iPad Pro 48px
        </FormattedText>
      </View>

      {/* CASO 2: Descrizione multi-riga */}
      <View style={styles.section}>
        <FormattedText fontSize={14} style={styles.label}>
          CASO 2: Descrizione Multi-Riga - Layout Fisso
        </FormattedText>

        <View style={styles.example}>
          <FormattedText
            fontSize={16}
            intelligentAccessibilityScaling={true}
            fixed={true}
            fixedLines={3}
          >
            Questa è una descrizione che si ottimizza automaticamente per
            utilizzare al meglio lo spazio disponibile su ogni dispositivo
            mantenendo sempre esattamente 3 righe di testo.
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.description}>
          ✅ 3 righe sempre, fontSize ottimale per ogni dispositivo, zoom
          accessibilità supportato
        </FormattedText>
      </View>

      {/* CASO 3: CTA Button */}
      <View style={styles.section}>
        <FormattedText fontSize={14} style={styles.label}>
          CASO 3: CTA Button - Controllo Preciso
        </FormattedText>

        <View style={styles.example}>
          <FormattedText
            fontSize={18}
            intelligentAccessibilityScaling={true}
            fixed={true}
            fixedLines={2}
            fontWeight="bold"
            style={{ textAlign: 'center' }}
          >
            Fai una Donazione{'\n'}Cambia una Vita
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.description}>
          ✅ CTA ottimizzato: fontSize perfetto per ogni dispositivo, layout
          sempre consistente
        </FormattedText>
      </View>

      {/* CASO 4: Testo normale senza sistema bi-direzionale */}
      <View style={styles.section}>
        <FormattedText fontSize={14} style={styles.label}>
          CASO 4: Testo Normale - Flusso Naturale
        </FormattedText>

        <View style={styles.example}>
          <FormattedText fontSize={16}>
            Questo testo normale usa solo il sistema di scaling universale. Va a
            capo naturalmente e si adatta ai diversi dispositivi con il scaling
            standard.
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.description}>
          ✅ Flusso naturale: perfetto per la maggior parte del testo
        </FormattedText>
      </View>

      {/* RIEPILOGO BEST PRACTICES */}
      <View style={styles.summarySection}>
        <FormattedText fontSize={20} style={styles.summaryTitle}>
          🎯 BEST PRACTICES SISTEMA BI-DIREZIONALE
        </FormattedText>

        <FormattedText fontSize={14} style={styles.summaryText}>
          ✅ intelligentAccessibilityScaling: PER TITOLI E TESTI IMPORTANTI
          {'\n'}✅ fixed + fixedLines: Controllo layout preciso{'\n'}✅ Zoom
          accessibilità: Supportato fino ai limiti calcolati{'\n'}✅
          Cross-platform: Comportamento identico iOS/Android{'\n'}✅
          Performance: Ottimizzato con cache e memoization{'\n'}✅
          Bi-direzionale: Riduce su piccoli, ingrandisce su grandi
        </FormattedText>
      </View>

      {/* ANTI-PATTERNS DA EVITARE */}
      <View style={styles.warningSection}>
        <FormattedText fontSize={20} style={styles.warningTitle}>
          ⚠️ ANTI-PATTERNS DA EVITARE
        </FormattedText>

        <FormattedText fontSize={14} style={styles.warningText}>
          ❌ Calcoli manuali screenWidth {'>'} 768 ? x : y{'\n'}❌
          allowSystemFontScaling={'{'} false {'}'} (blocca accessibilità){'\n'}
          ❌ Conditional rendering per dispositivi diversi{'\n'}❌ scaleFont()
          manuale + FormattedText (doppio scaling){'\n'}❌ fontSize hardcoded
          senza sistema responsive{'\n'}❌ Usare vecchio sistema fixed senza
          intelligentAccessibilityScaling
        </FormattedText>
      </View>
    </View>
  );
};

export default FormattedTextUniversalScalingExample;
