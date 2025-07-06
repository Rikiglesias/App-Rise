import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';

const IntelligentFixedLinesExample = () => {
  return (
    <ScrollView style={styles.container}>
      <FormattedText fontSize={28} style={styles.title}>
        🧠 Sistema Intelligente Fixed Lines
      </FormattedText>

      <FormattedText fontSize={16} style={styles.subtitle}>
        Il nuovo sistema NON tronca mai il testo, ma ridimensiona
        automaticamente il font per farlo entrare nelle righe specificate.
      </FormattedText>

      {/* ESEMPIO 1: Testo corto - font rimane normale */}
      <View style={styles.exampleContainer}>
        <FormattedText fontSize={14} style={styles.label}>
          📏 ESEMPIO 1: Testo corto (2 righe fisse)
        </FormattedText>
        <View style={styles.cardExample}>
          <FormattedText fontSize={20} fixed={true} fixedLines={2}>
            Testo breve che entra facilmente
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.note}>
          ✅ Font rimane 20px perché il testo è corto
        </FormattedText>
      </View>

      {/* ESEMPIO 2: Testo lungo - font si ridimensiona automaticamente */}
      <View style={styles.exampleContainer}>
        <FormattedText fontSize={14} style={styles.label}>
          🎯 ESEMPIO 2: Testo lungo (2 righe fisse)
        </FormattedText>
        <View style={styles.cardExample}>
          <FormattedText fontSize={20} fixed={true} fixedLines={2}>
            Questo è un testo molto più lungo che normalmente richiederebbe 3 o
            4 righe per essere visualizzato completamente, ma il sistema
            intelligente ridimensiona automaticamente il font
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.note}>
          🧠 Font automaticamente ridotto (es. 14px) per far entrare tutto in 2
          righe
        </FormattedText>
      </View>

      {/* ESEMPIO 3: Testo con line breaks */}
      <View style={styles.exampleContainer}>
        <FormattedText fontSize={14} style={styles.label}>
          🔄 ESEMPIO 3: Con line breaks espliciti (3 righe fisse)
        </FormattedText>
        <View style={styles.cardExample}>
          <FormattedText fontSize={18} fixed={true} fixedLines={3}>
            Prima riga{'\n'}Seconda riga molto lunga che normalmente andrebbe a
            capo{'\n'}Terza riga finale
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.note}>
          🎛️ Font ridimensionato per far entrare tutti i line breaks
        </FormattedText>
      </View>

      {/* CONFRONTO: Vecchio vs Nuovo sistema */}
      <View style={styles.comparisonContainer}>
        <FormattedText fontSize={16} style={styles.comparisonTitle}>
          📊 CONFRONTO: Vecchio vs Nuovo Sistema
        </FormattedText>

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            <FormattedText fontSize={14} style={styles.comparisonLabel}>
              ❌ VECCHIO (tronca il testo)
            </FormattedText>
            <View style={styles.cardComparison}>
              <FormattedText
                fontSize={16}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Questo testo lungo viene troncato con i tre puntini quando
                supera le due righe specificate...
              </FormattedText>
            </View>
          </View>

          <View style={styles.comparisonColumn}>
            <FormattedText fontSize={14} style={styles.comparisonLabel}>
              ✅ NUOVO (ridimensiona intelligente)
            </FormattedText>
            <View style={styles.cardComparison}>
              <FormattedText fontSize={16} fixed={true} fixedLines={2}>
                Questo testo lungo viene ridimensionato automaticamente per
                entrare perfettamente in due righe senza perdere nessuna parola
              </FormattedText>
            </View>
          </View>
        </View>
      </View>

      {/* CASI D'USO PRATICI */}
      <View style={styles.useCasesContainer}>
        <FormattedText fontSize={16} style={styles.useCasesTitle}>
          🎯 CASI D&apos;USO PRATICI
        </FormattedText>

        {/* Card progetti in griglia */}
        <FormattedText fontSize={14} style={styles.useCaseLabel}>
          📱 Card progetti (titoli sempre allineati)
        </FormattedText>
        <View style={styles.gridExample}>
          <View style={styles.projectCard}>
            <FormattedText
              fontSize={16}
              fixed={true}
              fixedLines={2}
              style={styles.projectTitle}
            >
              Progetto Breve
            </FormattedText>
            <FormattedText
              fontSize={12}
              fixed={true}
              fixedLines={3}
              style={styles.projectDescription}
            >
              Descrizione concisa del progetto che entra facilmente.
            </FormattedText>
          </View>

          <View style={styles.projectCard}>
            <FormattedText
              fontSize={16}
              fixed={true}
              fixedLines={2}
              style={styles.projectTitle}
            >
              Progetto con Nome Molto Lungo e Dettagliato
            </FormattedText>
            <FormattedText
              fontSize={12}
              fixed={true}
              fixedLines={3}
              style={styles.projectDescription}
            >
              Descrizione molto più lunga e dettagliata che normalmente
              richiederebbe molte più righe ma viene intelligentemente adattata.
            </FormattedText>
          </View>
        </View>
      </View>

      {/* Solo fixed senza fixedLines */}
      <View style={styles.exampleContainer}>
        <FormattedText fontSize={14} style={styles.label}>
          🎛️ ESEMPIO 4: Solo fixed={true} (senza fixedLines)
        </FormattedText>
        <View style={styles.cardExample}>
          <FormattedText fontSize={18} fixed={true}>
            Questo testo ha layout controllato ma può andare su più righe
            naturalmente. Il font non viene ridimensionato.
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.note}>
          📏 Layout controllato, testo naturale (no ridimensionamento)
        </FormattedText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  exampleContainer: {
    marginBottom: 25,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardExample: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 5,
  },
  note: {
    fontStyle: 'italic',
    color: '#888',
  },
  comparisonContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  comparisonTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  comparisonColumn: {
    flex: 1,
  },
  comparisonLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardComparison: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 60, // Altezza fissa per confronto
  },
  useCasesContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  useCasesTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c5282',
  },
  useCaseLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c5282',
  },
  gridExample: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  projectCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  projectTitle: {
    fontWeight: 'bold',
    color: '#2c5282',
    marginBottom: 8,
  },
  projectDescription: {
    color: '#4a5568',
    lineHeight: 16,
  },
});

export default IntelligentFixedLinesExample;
