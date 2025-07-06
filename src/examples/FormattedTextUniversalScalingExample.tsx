import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';

/**
 * ESEMPIO: BEST PRACTICES ALIGNED - Come Grandi Aziende Tech
 *
 * FILOSOFIA CORRETTA:
 * 1. fontSize base (35) - sempre RAW, scaleFont() automatico
 * 2. \n manuale - controllo preciso quando necessario
 * 3. fixedLines - OPZIONALE, solo per controllo rigoroso layout
 * 4. Flusso naturale - default per la maggior parte del testo
 */
export const FormattedTextUniversalScalingExample: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* CASO 1: Flusso naturale (RACCOMANDATO per la maggior parte del testo) */}
      <View style={styles.section}>
        <FormattedText variant="body-small" fixedLines={1} style={styles.label}>
          CASO 1: Flusso Naturale (Best Practice)
        </FormattedText>

        <FormattedText
          fontSize={24} // Base size - scaleFont automatico
          style={styles.example}
        >
          Rise Against Hunger Italia - Combattiamo la Fame nel Mondo
        </FormattedText>

        <FormattedText
          variant="body-small"
          fixedLines={1}
          style={styles.description}
        >
          ✅ Come Netflix, Airbnb, Uber: testo fluisce naturalmente
        </FormattedText>
      </View>

      {/* CASO 2: Controllo preciso con \n e fixedLines (quando necessario) */}
      <View style={styles.section}>
        <FormattedText variant="body-small" fixedLines={1} style={styles.label}>
          CASO 2: Controllo Preciso Layout
        </FormattedText>

        <FormattedText
          fontSize={28}
          fixedLines={2} // Solo quando serve controllo preciso
          style={styles.example}
        >
          Rise Against{'\n'}Hunger Italia
        </FormattedText>

        <FormattedText
          variant="body-small"
          fixedLines={1}
          style={styles.description}
        >
          ✅ fixedLines solo quando serve controllo rigido layout
        </FormattedText>
      </View>

      {/* CASO 3: Titoli responsive senza vincoli */}
      <View style={styles.section}>
        <FormattedText variant="body-small" fixedLines={1} style={styles.label}>
          CASO 3: Titoli Responsive
        </FormattedText>

        <FormattedText
          variant="headline-large" // Usa variant predefinito
          style={styles.example}
        >
          Il Nostro Impatto Globale
        </FormattedText>

        <FormattedText variant="body-large" style={styles.example}>
          Unisciti a noi nella lotta contro la fame per creare un mondo migliore
          per tutti
        </FormattedText>

        <FormattedText
          variant="body-small"
          fixedLines={1}
          style={styles.description}
        >
          ✅ Scaling automatico, flusso naturale, nessun vincolo
        </FormattedText>
      </View>

      {/* CASO 4: CTA con controllo preciso */}
      <View style={styles.section}>
        <FormattedText variant="body-small" fixedLines={1} style={styles.label}>
          CASO 4: CTA con Layout Fisso
        </FormattedText>

        <View style={styles.ctaContainer}>
          <FormattedText
            fontSize={20}
            fixedLines={2} // Controllo preciso per CTA
            style={styles.ctaText}
          >
            DONA SUBITO{'\n'}Cambia una Vita
          </FormattedText>
        </View>

        <FormattedText
          variant="body-small"
          fixedLines={1}
          style={styles.description}
        >
          ✅ CTA: fixedLines per layout button perfetto
        </FormattedText>
      </View>

      {/* RIEPILOGO BEST PRACTICES */}
      <View style={styles.summarySection}>
        <FormattedText
          variant="headline-small"
          fixedLines={1}
          style={styles.summaryTitle}
        >
          🎯 BEST PRACTICES ENTERPRISE
        </FormattedText>

        <FormattedText variant="body-medium" style={styles.summaryText}>
          ✅ Flusso naturale: DEFAULT per 90% del testo{'\n'}✅ fixedLines: SOLO
          quando serve controllo preciso{'\n'}✅ \n manuale: controllo a capo
          quando necessario{'\n'}✅ fontSize base: scaleFont() automatico{'\n'}
          ✅ Variants: usa predefiniti quando possibile{'\n'}✅ Come grandi
          aziende: Netflix, Airbnb, Uber
        </FormattedText>
      </View>

      {/* ANTI-PATTERNS DA EVITARE */}
      <View style={styles.warningSection}>
        <FormattedText
          variant="headline-small"
          fixedLines={1}
          style={styles.warningTitle}
        >
          ⚠️ ANTI-PATTERNS DA EVITARE
        </FormattedText>

        <FormattedText
          variant="body-medium"
          fixedLines={6}
          style={styles.warningText}
        >
          ❌ fixedLines su tutto il testo (troppo rigido){'\n'}❌ scaleFont()
          manuale + FormattedText (doppio scaling){'\n'}❌
          wrapMode=&quot;fixed&quot; senza motivo specifico{'\n'}❌ Forzare
          righe quando non serve{'\n'}❌ fontSize hardcoded senza responsive
          {'\n'}❌ Ignorare il flusso naturale del testo
        </FormattedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  example: {
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#059669',
    fontStyle: 'italic',
  },
  ctaContainer: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  ctaText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
  },
  summarySection: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  summaryTitle: {
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  summaryText: {
    color: '#1f2937',
    lineHeight: 24,
  },
  warningSection: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  warningTitle: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  warningText: {
    color: '#7f1d1d',
    lineHeight: 24,
  },
});

export default FormattedTextUniversalScalingExample;
