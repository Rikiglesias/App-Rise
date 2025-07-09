import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { FormattedText } from '../../components/ui';

/**
 * 🧪 SCREEN DI TEST - Dimostra il sistema automatico in azione
 *
 * Aggiungi questo screen alla navigazione per testare il sistema
 */

const TestAutomaticoScreen: React.FC = () => {
  const { width: screenWidth } = Dimensions.get('window');

  const testTexts = [
    'Rise Against Hunger Italia',
    'Combattiamo la fame nel mondo attraverso programmi alimentari',
    'Fai la Differenza Oggi',
    'Insieme possiamo sconfiggere la fame nel mondo con azioni concrete e sostenibili',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* INFO DISPOSITIVO */}
      <View style={styles.deviceInfo}>
        <FormattedText
          fontSize={16}
          fontWeight="bold"
          style={styles.deviceTitle}
        >
          📱 INFO DISPOSITIVO CORRENTE:
        </FormattedText>
        <FormattedText fontSize={14} style={styles.deviceText}>
          Larghezza: {screenWidth}px
        </FormattedText>
        <FormattedText fontSize={14} style={styles.deviceText}>
          Tipo:{' '}
          {(() => {
            if (screenWidth <= 414) return 'Telefono';
            if (screenWidth <= 768) return 'Tablet piccolo';
            return 'Tablet grande';
          })()}
        </FormattedText>
      </View>

      {/* DEMO TITOLO PRINCIPALE */}
      <View style={styles.demoSection}>
        <FormattedText
          fontSize={16}
          fontWeight="bold"
          style={styles.sectionTitle}
        >
          🎯 TITOLO PRINCIPALE (sempre 1 riga):
        </FormattedText>

        <View style={styles.demoContainer}>
          <FormattedText
            fontSize={42} // ← Dimensione di partenza
            intelligentAccessibilityScaling={true} // ← 🧠 CERVELLO ATTIVO
            fixed={true} // ← 🔒 SISTEMA ATTIVO
            fixedLines={1} // ← 📏 SEMPRE 1 RIGA
            allowSystemFontScaling={true}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            fontWeight="bold"
            style={styles.titleDemo}
          >
            Rise Against Hunger Italia
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.explanation}>
          ⚡ Font si adatta automaticamente per stare sempre in 1 riga su questo
          dispositivo
        </FormattedText>
      </View>

      {/* TEST TESTI DIVERSI */}
      {testTexts.map((text, index) => (
        <View key={`test-${text.slice(0, 20)}`} style={styles.testSection}>
          <FormattedText
            fontSize={14}
            fontWeight="semibold"
            style={styles.testTitle}
          >
            🧪 TEST {index + 1}: &quot;{text.substring(0, 20)}&quot;...
          </FormattedText>

          <View style={styles.testContainer}>
            <FormattedText
              fontSize={32} // ← Dimensione fissa per confronto
              intelligentAccessibilityScaling={true} // ← 🧠 CERVELLO ATTIVO
              fixed={true} // ← 🔒 SISTEMA ATTIVO
              fixedLines={1} // ← 📏 SEMPRE 1 RIGA
              allowSystemFontScaling={true}
              lineBreakStrategyIOS="push-out"
              breakStrategyAndroid="highQuality"
              style={styles.testText}
            >
              {text}
            </FormattedText>
          </View>

          <FormattedText fontSize={11} style={styles.testExplanation}>
            Su iPhone SE si riduce • Su iPad si ingrandisce • Sempre 1 riga
          </FormattedText>
        </View>
      ))}

      {/* CONFRONTO PRIMA/DOPO */}
      <View style={styles.comparisonSection}>
        <FormattedText
          fontSize={16}
          fontWeight="bold"
          style={styles.sectionTitle}
        >
          ⚖️ CONFRONTO: Sistema VS Testo normale
        </FormattedText>

        {/* CON SISTEMA */}
        <View style={styles.comparisonContainer}>
          <FormattedText fontSize={12} style={styles.comparisonLabel}>
            ✅ CON Sistema Automatico:
          </FormattedText>
          <View style={styles.demoContainer}>
            <FormattedText
              fontSize={30}
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={1}
              style={styles.goodExample}
            >
              Testo che si adatta automaticamente
            </FormattedText>
          </View>
        </View>

        {/* SENZA SISTEMA */}
        <View style={styles.comparisonContainer}>
          <FormattedText fontSize={12} style={styles.comparisonLabel}>
            ❌ SENZA Sistema (normale):
          </FormattedText>
          <View style={styles.demoContainer}>
            <FormattedText fontSize={30} style={styles.badExample}>
              Testo che può andare su più righe senza controllo
            </FormattedText>
          </View>
        </View>
      </View>

      {/* ISTRUZIONI */}
      <View style={styles.instructions}>
        <FormattedText
          fontSize={16}
          fontWeight="bold"
          style={styles.instructionsTitle}
        >
          📋 COME USARE NEL TUO CODICE:
        </FormattedText>

        <FormattedText fontSize={12} style={styles.codeExample}>
          {`<FormattedText
  fontSize={42}                           // ← Scegli dimensione
  intelligentAccessibilityScaling={true} // ← ATTIVA cervello
  fixed={true}                           // ← ATTIVA sistema
  fixedLines={1}                         // ← Scegli righe
  allowSystemFontScaling={true}
>
  Il tuo testo qui
</FormattedText>`}
        </FormattedText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  deviceInfo: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  deviceTitle: {
    color: '#1E40AF',
    marginBottom: 4,
  },
  deviceText: {
    color: '#3730A3',
  },
  demoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  comparisonSection: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FB923C',
  },
  comparisonContainer: {
    marginBottom: 12,
  },
  instructions: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: 12,
  },
  testTitle: {
    color: '#475569',
    marginBottom: 8,
  },
  instructionsTitle: {
    color: '#16A34A',
    marginBottom: 12,
  },
  demoContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  testContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginVertical: 4,
  },
  titleDemo: {
    textAlign: 'center',
    color: '#DC2626',
  },
  testText: {
    textAlign: 'center',
    color: '#1F2937',
  },
  goodExample: {
    textAlign: 'center',
    color: '#059669',
  },
  badExample: {
    textAlign: 'center',
    color: '#DC2626',
  },
  explanation: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  testExplanation: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  comparisonLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  codeExample: {
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    color: '#374151',
  },
});

export default TestAutomaticoScreen;
