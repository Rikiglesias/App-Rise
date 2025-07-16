import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';

/**
 * Esempio pratico del nuovo wrapMode 'fixed'
 * Garantisce consistenza assoluta delle righe su tutti i dispositivi
 */
export const FixedLinesExample: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Titolo sempre su 2 righe esatte */}
      <FormattedText
        variant="headline-large"
        wrapMode="fixed"
        fixedLines={2}
        style={styles.title}
      >
        Rise Against Hunger Italia - Combattiamo la Fame Insieme
      </FormattedText>

      {/* Sottotitolo sempre su 1 riga esatta */}
      <FormattedText
        variant="title-medium"
        wrapMode="fixed"
        fixedLines={1}
        style={styles.subtitle}
      >
        La nostra missione per un mondo senza fame
      </FormattedText>

      {/* Descrizione sempre su 3 righe esatte */}
      <FormattedText
        variant="body-medium"
        wrapMode="fixed"
        fixedLines={3}
        style={styles.description}
      >
        Uniamo le forze per combattere la fame nel mondo attraverso azioni
        concrete, distribuzione di pasti nutrienti e programmi di sviluppo
        sostenibile che trasformano le comunità e salvano vite umane ogni
        giorno.
      </FormattedText>

      {/* Esempi di diverse configurazioni fixedLines */}
      <View style={styles.examples}>
        <FormattedText variant="label-medium" style={styles.label}>
          Badge/Etichette (1 riga):
        </FormattedText>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={1}
          style={styles.badgeText}
        >
          Donazione Completata
        </FormattedText>

        <FormattedText variant="label-medium" style={styles.label}>
          Descrizioni Medie (2 righe):
        </FormattedText>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={2}
          style={styles.mediumText}
        >
          Ogni donazione aiuta a fornire pasti nutrienti alle famiglie in
          difficoltà
        </FormattedText>

        <FormattedText variant="label-medium" style={styles.label}>
          Contenuti Estesi (4 righe):
        </FormattedText>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={4}
          style={styles.extendedText}
        >
          Il nostro programma di distribuzione pasti raggiunge comunità remote e
          vulnerabili, garantendo accesso a cibo nutriente e sicuro per bambini,
          famiglie e anziani che vivono in condizioni di povertà estrema.
        </FormattedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#424242',
  },
  description: {
    textAlign: 'justify',
    marginBottom: 32,
    color: '#616161',
    lineHeight: 24, // FISSO: era scaleFont(20) - ora valore fisso ottimizzato
  },
  examples: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#1976d2',
  },
  badgeText: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  mediumText: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  extendedText: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
  },
});

export default FixedLinesExample;
