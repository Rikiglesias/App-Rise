import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { FormattedText } from '../components/ui/FormattedText';

const ConsistentTextExample = () => {
  const testoLungo5Righe = `Rise Against Hunger Italia è un'organizzazione non profit che combatte la fame nel mondo attraverso programmi alimentari concreti, coinvolgendo attivamente comunità locali, volontari di ogni età e partner strategici per creare un impatto duraturo e sostenibile nelle regioni più vulnerabili del pianeta, distribuendo milioni di pasti nutrienti ogni anno.`;

  const testoMedio3Righe = `La nostra missione è semplice ma potente: eliminare la fame nel mondo attraverso l'unione di volontari appassionati e programmi alimentari efficaci che raggiungono chi ne ha più bisogno.`;

  const testoBreve2Righe = `Insieme possiamo fare la differenza nella lotta contro la fame globale attraverso azioni concrete.`;

  return (
    <ScrollView style={styles.container}>
      <FormattedText fontSize={24} style={styles.title}>
        🎯 Test Consistenza Cross-Device
      </FormattedText>

      <FormattedText fontSize={16} style={styles.subtitle}>
        Questi testi si comportano IDENTICAMENTE su iPhone SE, iPhone 15 Pro
        Max, iPad e tutti gli Android
      </FormattedText>

      {/* TEST 1: Testo lungo 5 righe FISSO */}
      <View style={styles.testContainer}>
        <FormattedText fontSize={14} style={styles.testLabel}>
          📏 TEST 1: Testo lungo - SEMPRE 5 righe (stessi a capo ovunque)
        </FormattedText>
        <View style={styles.textCard}>
          <FormattedText
            fontSize={18}
            fixed={true}
            fixedLines={5}
            style={styles.testText}
          >
            {testoLungo5Righe}
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.explanation}>
          ✅ Su iPhone SE: font ~14px | Su iPad: font ~16px | Righe SEMPRE 5, a
          capo SEMPRE identico
        </FormattedText>
      </View>

      {/* TEST 2: Testo medio 3 righe FISSO */}
      <View style={styles.testContainer}>
        <FormattedText fontSize={14} style={styles.testLabel}>
          📏 TEST 2: Testo medio - SEMPRE 3 righe
        </FormattedText>
        <View style={styles.textCard}>
          <FormattedText
            fontSize={16}
            fixed={true}
            fixedLines={3}
            style={styles.testText}
          >
            {testoMedio3Righe}
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.explanation}>
          ✅ Font si adatta automaticamente ma righe SEMPRE 3 su tutti i device
        </FormattedText>
      </View>

      {/* TEST 3: Testo breve 2 righe FISSO */}
      <View style={styles.testContainer}>
        <FormattedText fontSize={14} style={styles.testLabel}>
          📏 TEST 3: Testo breve - SEMPRE 2 righe
        </FormattedText>
        <View style={styles.textCard}>
          <FormattedText
            fontSize={20}
            fixed={true}
            fixedLines={2}
            style={styles.testText}
          >
            {testoBreve2Righe}
          </FormattedText>
        </View>
        <FormattedText fontSize={12} style={styles.explanation}>
          ✅ Testo corto: font rimane 20px, va a capo naturalmente in 2 righe
        </FormattedText>
      </View>

      {/* CONFRONTO: Con vs Senza sistema intelligente */}
      <View style={styles.comparisonContainer}>
        <FormattedText fontSize={16} style={styles.comparisonTitle}>
          ⚖️ CONFRONTO: Sistema Normale vs Intelligente
        </FormattedText>

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            <FormattedText fontSize={12} style={styles.comparisonLabel}>
              ❌ NORMALE (inconsistente)
            </FormattedText>
            <View style={styles.comparisonCard}>
              <FormattedText fontSize={16} style={styles.normalText}>
                {testoLungo5Righe}
              </FormattedText>
            </View>
            <FormattedText fontSize={10} style={styles.comparisonNote}>
              Su iPhone SE: 8 righe | Su iPad: 4 righe | A capo diversi!
            </FormattedText>
          </View>

          <View style={styles.comparisonColumn}>
            <FormattedText fontSize={12} style={styles.comparisonLabel}>
              ✅ INTELLIGENTE (identico)
            </FormattedText>
            <View style={styles.comparisonCard}>
              <FormattedText
                fontSize={16}
                fixed={true}
                fixedLines={5}
                style={styles.intelligentText}
              >
                {testoLungo5Righe}
              </FormattedText>
            </View>
            <FormattedText fontSize={10} style={styles.comparisonNote}>
              Su TUTTI i device: SEMPRE 5 righe | A capo IDENTICI!
            </FormattedText>
          </View>
        </View>
      </View>

      {/* LINEE GUIDA PRATICHE */}
      <View style={styles.guidelinesContainer}>
        <FormattedText fontSize={16} style={styles.guidelinesTitle}>
          📋 LINEE GUIDA per Consistenza Assoluta
        </FormattedText>

        <View style={styles.guidelineItem}>
          <FormattedText fontSize={14} style={styles.guidelineNumber}>
            1.
          </FormattedText>
          <FormattedText fontSize={14} style={styles.guidelineText}>
            <FormattedText fontWeight="bold">
              Sempre fontSize + fixed + fixedLines
            </FormattedText>{' '}
            per layout controllato
          </FormattedText>
        </View>

        <View style={styles.guidelineItem}>
          <FormattedText fontSize={14} style={styles.guidelineNumber}>
            2.
          </FormattedText>
          <FormattedText fontSize={14} style={styles.guidelineText}>
            <FormattedText fontWeight="bold">fontSize base</FormattedText>:
            16-20px per testo principale, 14-16px per descrizioni
          </FormattedText>
        </View>

        <View style={styles.guidelineItem}>
          <FormattedText fontSize={14} style={styles.guidelineNumber}>
            3.
          </FormattedText>
          <FormattedText fontSize={14} style={styles.guidelineText}>
            <FormattedText fontWeight="bold">fixedLines</FormattedText>: 2-3 per
            titoli, 3-5 per descrizioni, max 8 righe
          </FormattedText>
        </View>

        <View style={styles.guidelineItem}>
          <FormattedText fontSize={14} style={styles.guidelineNumber}>
            4.
          </FormattedText>
          <FormattedText fontSize={14} style={styles.guidelineText}>
            <FormattedText fontWeight="bold">Test su 3 device</FormattedText>:
            iPhone SE (piccolo), iPhone 15 Pro (standard), iPad (grande)
          </FormattedText>
        </View>
      </View>

      {/* ESEMPIO FINALE: Card perfette in griglia */}
      <View style={styles.finalExample}>
        <FormattedText fontSize={16} style={styles.finalTitle}>
          🎯 ESEMPIO FINALE: Card Progetti Perfette
        </FormattedText>
        <FormattedText fontSize={12} style={styles.finalSubtitle}>
          Titoli e descrizioni sempre allineati, righe identiche su tutti i
          device
        </FormattedText>

        <View style={styles.cardsGrid}>
          <View style={styles.perfectCard}>
            <FormattedText
              fontSize={16}
              fixed={true}
              fixedLines={2}
              style={styles.cardTitle}
            >
              Progetto Emergenza
            </FormattedText>
            <FormattedText
              fontSize={14}
              fixed={true}
              fixedLines={4}
              style={styles.cardDescription}
            >
              Distribuzione di pasti di emergenza nelle zone colpite da calamità
              naturali, con supporto logistico completo e team di volontari
              specializzati.
            </FormattedText>
          </View>

          <View style={styles.perfectCard}>
            <FormattedText
              fontSize={16}
              fixed={true}
              fixedLines={2}
              style={styles.cardTitle}
            >
              Programma Scolastico Nutrizione Bambini
            </FormattedText>
            <FormattedText
              fontSize={14}
              fixed={true}
              fixedLines={4}
              style={styles.cardDescription}
            >
              Supporto nutrizionale per bambini in età scolare con programmi di
              educazione alimentare e distribuzione pasti nelle scuole delle
              comunità più vulnerabili.
            </FormattedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a202c',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#4a5568',
    lineHeight: 22,
  },
  testContainer: {
    marginBottom: 25,
  },
  testLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d3748',
  },
  textCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  testText: {
    color: '#2d3748',
    lineHeight: 24,
  },
  explanation: {
    fontStyle: 'italic',
    color: '#718096',
    backgroundColor: '#f7fafc',
    padding: 8,
    borderRadius: 6,
  },
  comparisonContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  comparisonTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#c53030',
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  comparisonColumn: {
    flex: 1,
  },
  comparisonLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
  },
  normalText: {
    color: '#e53e3e',
    lineHeight: 22,
  },
  intelligentText: {
    color: '#38a169',
    lineHeight: 22,
  },
  comparisonNote: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    color: '#718096',
  },
  guidelinesContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c6f6d5',
  },
  guidelinesTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#22543d',
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  guidelineNumber: {
    fontWeight: 'bold',
    color: '#38a169',
    marginRight: 8,
    minWidth: 20,
  },
  guidelineText: {
    flex: 1,
    color: '#2d3748',
    lineHeight: 20,
  },
  finalExample: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ebf8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  finalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c5282',
  },
  finalSubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#4a5568',
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  perfectCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#2c5282',
    marginBottom: 10,
  },
  cardDescription: {
    color: '#4a5568',
    lineHeight: 18,
  },
});

export default ConsistentTextExample;
