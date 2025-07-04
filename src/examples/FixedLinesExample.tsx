import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';
import { scaleFont } from '../shared/constants/responsiveSystem';

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

      {/* Confronto con modalità auto (variabile) */}
      <View style={styles.comparison}>
        <FormattedText variant="label-medium" style={styles.label}>
          Modalità AUTO (variabile):
        </FormattedText>
        <FormattedText
          variant="body-small"
          wrapMode="auto"
          style={styles.autoText}
        >
          Questo testo può andare su 1, 2 o 3 righe a seconda del dispositivo
        </FormattedText>

        <FormattedText variant="label-medium" style={styles.label}>
          Modalità FIXED (consistente):
        </FormattedText>
        <FormattedText
          variant="body-small"
          wrapMode="fixed"
          fixedLines={2}
          style={styles.fixedText}
        >
          Questo testo sarà SEMPRE su esattamente 2 righe su tutti i dispositivi
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
    lineHeight: scaleFont(20),
  },
  comparison: {
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
  autoText: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  fixedText: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
  },
});

export default FixedLinesExample;
