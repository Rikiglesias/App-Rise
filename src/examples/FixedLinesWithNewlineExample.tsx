import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';

/**
 * ESEMPIO AVANZATO: wrapMode="fixed" + \n espliciti + ridimensionamento automatico
 *
 * DIMOSTRA:
 * 1. \n espliciti vengono rispettati (a capo obbligatorio)
 * 2. Font si ridimensiona automaticamente per rispettare fixedLines
 * 3. Layout matematicamente perfetto su tutti i dispositivi
 * 4. Combinazione perfetta: controllo righe + leggibilità garantita
 */
export const FixedLinesWithNewlineExample: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* CASO 1: \n espliciti con fixedLines=2 - PERFETTO */}
      <View style={styles.section}>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={2}
          style={styles.label}
        >
          CASO 1: \n espliciti + fixedLines=2
        </FormattedText>

        <FormattedText
          variant="headline-medium"
          wrapMode="fixed"
          fixedLines={2}
          style={styles.example}
        >
          Rise Against Hunger Italia{'\n'}Combattiamo la Fame Insieme
        </FormattedText>

        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.description}
        >
          ✅ 2 righe esatte, font ridimensionato automaticamente
        </FormattedText>
      </View>

      {/* CASO 2: \n espliciti con fixedLines=3 - ADATTAMENTO INTELLIGENTE */}
      <View style={styles.section}>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={3}
          style={styles.label}
        >
          CASO 2: \n espliciti + fixedLines=3
        </FormattedText>

        <FormattedText
          variant="title-large"
          wrapMode="fixed"
          fixedLines={3}
          style={styles.example}
        >
          Missione{'\n'}Visione{'\n'}Impatto Globale
        </FormattedText>

        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.description}
        >
          ✅ 3 righe esatte, ogni \n rispettato, font ottimizzato
        </FormattedText>
      </View>

      {/* CASO 3: Testo lungo senza \n - WRAPPING AUTOMATICO + SCALING */}
      <View style={styles.section}>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={3}
          style={styles.label}
        >
          CASO 3: Wrapping automatico + fixedLines=3
        </FormattedText>

        <FormattedText
          variant="body-large"
          wrapMode="fixed"
          fixedLines={3}
          style={styles.example}
        >
          La nostra organizzazione lavora instancabilmente per combattere la
          fame nel mondo attraverso progetti concreti e sostenibili che
          coinvolgono le comunità locali.
        </FormattedText>

        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.description}
        >
          ✅ 3 righe esatte, wrapping automatico, font ridimensionato
        </FormattedText>
      </View>

      {/* CASO 4: Combinazione \n + testo lungo - GESTIONE IBRIDA */}
      <View style={styles.section}>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={4}
          style={styles.label}
        >
          CASO 4: \n + testo lungo + fixedLines=4
        </FormattedText>

        <FormattedText
          variant="body-medium"
          wrapMode="fixed"
          fixedLines={4}
          style={styles.example}
        >
          🌍 IMPATTO GLOBALE{'\n'}Abbiamo servito oltre 1 milione di pasti in
          tutto il mondo{'\n'}📈 CRESCITA COSTANTE{'\n'}La nostra rete di
          volontari cresce ogni giorno
        </FormattedText>

        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.description}
        >
          ✅ 4 righe esatte, \n rispettati, font ottimizzato per contenuto
        </FormattedText>
      </View>

      {/* CASO 5: CTA con \n - LAYOUT PERFETTO */}
      <View style={styles.section}>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={2}
          style={styles.label}
        >
          CASO 5: CTA con \n + fixedLines=2
        </FormattedText>

        <View style={styles.ctaContainer}>
          <FormattedText
            variant="title-medium"
            wrapMode="fixed"
            fixedLines={2}
            style={styles.ctaText}
          >
            UNISCITI A NOI{'\n'}Fai la Differenza Oggi
          </FormattedText>
        </View>

        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.description}
        >
          ✅ CTA perfetto: 2 righe esatte, impatto visivo massimo
        </FormattedText>
      </View>

      {/* RIEPILOGO VANTAGGI */}
      <View style={styles.summarySection}>
        <FormattedText
          variant="headline-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.summaryTitle}
        >
          🎯 VANTAGGI SISTEMA FIXED + \n
        </FormattedText>

        <FormattedText
          variant="body-medium"
          wrapMode="fixed"
          fixedLines={6}
          style={styles.summaryText}
        >
          ✅ A capo obbligatorio: \n sempre rispettato{'\n'}✅ Ridimensionamento
          automatico: font ottimizzato{'\n'}✅ Layout matematico: righe esatte
          garantite{'\n'}✅ Cross-platform: identico iOS e Android{'\n'}✅
          Performance: calcolo ottimizzato{'\n'}✅ UX professionale: controllo
          totale layout
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
});

export default FixedLinesWithNewlineExample;
