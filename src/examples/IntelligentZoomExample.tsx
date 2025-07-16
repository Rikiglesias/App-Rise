/**
 * ESEMPIO: ZOOM INTELLIGENTE CON SISTEMA BI-DIREZIONALE
 *
 * Dimostra come il nuovo sistema intelligentAccessibilityScaling permette lo zoom del telefono
 * ma calcola automaticamente i limiti per rispettare sempre il numero di righe fisse impostate
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { FormattedText, ResponsiveBox } from '../components/ui';

/**
 * Esempio di test per l'algoritmo aggiornato FormattedText
 * Verifica che nessun testo esca mai dal container
 */
export const IntelligentZoomExample: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <ResponsiveBox preset="container" style={styles.section}>
        <FormattedText fontSize={24} style={styles.sectionTitle}>
          🧪 TEST ALGORITMO AGGIORNATO
        </FormattedText>

        {/* Test 1: Testo lungo che deve ridursi */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 1: Testo molto lungo in 1 riga
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={28}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={1}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Questo è un testo estremamente lungo che deve essere ridotto
              automaticamente
            </FormattedText>
          </View>
        </View>

        {/* Test 2: Testo corto che può rimanere grande */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 2: Testo corto in 1 riga
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={28}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={1}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Testo corto
            </FormattedText>
          </View>
        </View>

        {/* Test 3: Testo con linee esplicite */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 3: Testo con \n espliciti
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={28}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={2}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Prima riga molto lunga{'\n'}Seconda riga altrettanto lunga
            </FormattedText>
          </View>
        </View>

        {/* Test 4: Caso estremo - testo lunghissimo */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 4: Caso estremo (deve ridursi molto)
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={32}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={2}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Questo è un testo estremamente lungo che rappresenta un caso
              estremo per testare l&apos;algoritmo di riduzione automatica
            </FormattedText>
          </View>
        </View>

        {/* Test 5: Titolo come quello reale */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 5: Titolo &quot;Rise Against Hunger Italia&quot;
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={32}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={1}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Rise Against Hunger Italia
            </FormattedText>
          </View>
        </View>

        {/* Test 6: Descrizione come quella reale */}
        <View style={styles.testContainer}>
          <FormattedText fontSize={16} style={styles.label}>
            Test 6: Descrizione &quot;Unisciti a noi...&quot;
          </FormattedText>
          <View style={styles.border}>
            <FormattedText
              fontSize={18}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={2}
              allowSystemFontScaling={false}
              style={styles.testText}
            >
              Unisciti a noi nella lotta contro la fame nel mondo
            </FormattedText>
          </View>
        </View>

        <FormattedText fontSize={14} style={styles.note}>
          ✅ Tutti i testi devono rimanere dentro i bordi rossi
        </FormattedText>
      </ResponsiveBox>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  testContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  border: {
    borderWidth: 2,
    borderColor: '#ff0000',
    borderStyle: 'dashed',
    padding: 8,
    backgroundColor: '#fff',
  },
  testText: {
    color: '#333',
  },
  note: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    marginTop: 20,
  },
});

export default IntelligentZoomExample;
