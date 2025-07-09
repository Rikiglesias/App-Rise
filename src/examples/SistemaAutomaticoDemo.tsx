import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { FormattedText } from '../components/ui';

/**
 * 🎯 DEMO SISTEMA AUTOMATICO
 *
 * Questo file dimostra come il sistema FormattedText risolve automaticamente:
 * ✅ Adattamento a tutti i telefoni
 * ✅ Mai fuori dai bordi
 * ✅ Righe precise (mai di più, mai di meno)
 * ✅ Testo mai nascosto
 */

const SistemaAutomaticoDemo: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* 🎯 ESEMPIO 1: Titolo che si adatta automaticamente */}
      <View style={styles.section}>
        <FormattedText fontSize={16} style={styles.label}>
          📱 TITOLO AUTOMATICO (sempre 1 riga su OGNI telefono):
        </FormattedText>

        <View style={styles.demo}>
          <FormattedText
            fontSize={40} // ← Dimensione di partenza
            intelligentAccessibilityScaling={true} // ← MAGIA: adatta automaticamente
            fixed={true} // ← Attiva sistema intelligente
            fixedLines={1} // ← SEMPRE 1 riga esatta
            allowSystemFontScaling={true}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            fontWeight="bold"
            style={{ textAlign: 'center', color: '#DC2626' }}
          >
            Rise Against Hunger Italia
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.explanation}>
          ⚡ Il sistema calcola automaticamente la dimensione perfetta per
          questo telefono
        </FormattedText>
      </View>

      {/* 🎯 ESEMPIO 2: Descrizione sempre 2 righe */}
      <View style={styles.section}>
        <FormattedText fontSize={16} style={styles.label}>
          📝 DESCRIZIONE AUTOMATICA (sempre 2 righe su OGNI telefono):
        </FormattedText>

        <View style={styles.demo}>
          <FormattedText
            fontSize={18} // ← Dimensione di partenza
            intelligentAccessibilityScaling={true} // ← MAGIA: adatta automaticamente
            fixed={true} // ← Attiva sistema intelligente
            fixedLines={2} // ← SEMPRE 2 righe esatte
            allowSystemFontScaling={true}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            style={{ textAlign: 'center', color: '#1F2937' }}
          >
            Combattiamo la fame nel mondo attraverso programmi alimentari
            concreti e sostenibili
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.explanation}>
          ⚡ Su iPhone SE si riduce, su iPad si ingrandisce, sempre 2 righe
          perfette
        </FormattedText>
      </View>

      {/* 🎯 ESEMPIO 3: Bottone sempre 1 riga */}
      <View style={styles.section}>
        <FormattedText fontSize={16} style={styles.label}>
          🔘 BOTTONE AUTOMATICO (sempre 1 riga su OGNI telefono):
        </FormattedText>

        <View style={[styles.demo, styles.button]}>
          <FormattedText
            fontSize={20} // ← Dimensione di partenza
            intelligentAccessibilityScaling={true} // ← MAGIA: adatta automaticamente
            fixed={true} // ← Attiva sistema intelligente
            fixedLines={1} // ← SEMPRE 1 riga esatta
            allowSystemFontScaling={true}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            fontWeight="semibold"
            style={{ textAlign: 'center', color: '#FFFFFF' }}
          >
            Fai una Donazione Oggi
          </FormattedText>
        </View>

        <FormattedText fontSize={12} style={styles.explanation}>
          ⚡ Il testo si adatta automaticamente alla larghezza del bottone
        </FormattedText>
      </View>

      {/* 🎯 REGOLE SEMPLICI */}
      <View style={styles.rules}>
        <FormattedText
          fontSize={18}
          fontWeight="bold"
          style={styles.rulesTitle}
        >
          📋 REGOLE SEMPLICI PER USARE IL SISTEMA:
        </FormattedText>

        <FormattedText fontSize={14} style={styles.rule}>
          1️⃣ Usa sempre: intelligentAccessibilityScaling={'{true}'}
        </FormattedText>
        <FormattedText fontSize={14} style={styles.rule}>
          2️⃣ Usa sempre: fixed={'{true}'}
        </FormattedText>
        <FormattedText fontSize={14} style={styles.rule}>
          3️⃣ Decidi TU le righe: fixedLines={'{1}'} (o 2, 3...)
        </FormattedText>
        <FormattedText fontSize={14} style={styles.rule}>
          4️⃣ Scegli fontSize di partenza: fontSize={'{40}'} (o 20, 30...)
        </FormattedText>
        <FormattedText fontSize={14} style={styles.rule}>
          ✨ Il sistema fa tutto il resto AUTOMATICAMENTE!
        </FormattedText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  explanation: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  rules: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  rulesTitle: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  rule: {
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

export default SistemaAutomaticoDemo;
