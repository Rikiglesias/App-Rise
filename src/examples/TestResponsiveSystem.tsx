/**
 * TEST SISTEMA RESPONSIVE
 *
 * Componente per testare LIVE che l'app rimane identica su ogni dispositivo
 * Puoi usare questo componente per verificare su dispositivi reali
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  FormattedText,
  ResponsiveBox,
  ResponsiveStack,
} from '../components/ui';

export const TestResponsiveSystem: React.FC = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ResponsiveBox preset="container" padding={20}>
        <FormattedText
          fontSize={24}
          fontWeight="bold"
          style={{ marginBottom: 20, textAlign: 'center' }}
        >
          🧪 TEST SISTEMA RESPONSIVE
        </FormattedText>

        {/* TEST 1: Titolo che DEVE stare in 1 riga */}
        <TestCase
          title="TEST 1: Titolo lungo in 1 riga"
          description="Questo titolo DEVE sempre stare in una riga sola"
        >
          <FormattedText
            fontSize={32}
            fontWeight="bold"
            intelligentAccessibilityScaling={true}
            fixed={true}
            fixedLines={1}
            allowSystemFontScaling={false}
            style={{ color: '#DC2626' }}
          >
            Rise Against Hunger Italia - Combatti la fame
          </FormattedText>
        </TestCase>

        {/* TEST 2: Testo che NON deve mai essere tagliato */}
        <TestCase
          title="TEST 2: Testo multi-riga senza ellipsis"
          description="Questo testo DEVE sempre essere visibile per intero in 3 righe"
        >
          <FormattedText
            fontSize={16}
            intelligentAccessibilityScaling={true}
            fixed={true}
            fixedLines={3}
            allowSystemFontScaling={false}
          >
            Ogni pasto che confezioniamo è un passo verso un mondo senza fame.
            Unisciti a noi nella missione di nutrire chi ha bisogno. Insieme
            possiamo fare la differenza per milioni di persone.
          </FormattedText>
        </TestCase>

        {/* TEST 3: Layout responsive con cards */}
        <TestCase
          title="TEST 3: Cards responsive"
          description="Le cards devono adattarsi automaticamente"
        >
          <ResponsiveStack
            direction="horizontal"
            spacing={12}
            style={{ flexWrap: 'wrap' }}
          >
            {[1, 2, 3, 4].map(num => (
              <ResponsiveBox
                key={num}
                preset="card"
                autoBackgroundColor="card"
                padding={16}
                style={{ marginBottom: 12 }}
              >
                <FormattedText fontSize={16} fontWeight="bold">
                  Card {num}
                </FormattedText>
                <FormattedText fontSize={14} style={{ marginTop: 4 }}>
                  Contenuto card
                </FormattedText>
              </ResponsiveBox>
            ))}
          </ResponsiveStack>
        </TestCase>

        {/* TEST 4: Dark mode automatico */}
        <TestCase
          title="TEST 4: Dark mode automatico"
          description="I colori devono adattarsi al tema"
        >
          <ResponsiveBox
            autoBackgroundColor="primary"
            padding={16}
            style={{ borderRadius: 8 }}
          >
            <FormattedText fontSize={16}>
              Background che cambia automaticamente con dark mode
            </FormattedText>
          </ResponsiveBox>
        </TestCase>

        {/* RISULTATI ATTESI */}
        <ResponsiveBox
          autoBackgroundColor="card"
          padding={20}
          style={{
            borderRadius: 12,
            marginTop: 32,
            borderWidth: 2,
            borderColor: '#059669',
          }}
        >
          <FormattedText
            fontSize={18}
            fontWeight="bold"
            style={{ color: '#059669', marginBottom: 12 }}
          >
            ✅ RISULTATI ATTESI SU OGNI DISPOSITIVO
          </FormattedText>

          <ResultItem text="Titolo SEMPRE in 1 riga (mai su 2)" />
          <ResultItem text="Testo SEMPRE in 3 righe (mai tagliato)" />
          <ResultItem text="Cards che si adattano alla larghezza" />
          <ResultItem text="Proporzioni IDENTICHE su ogni marca" />
          <ResultItem text="Nessun testo fuori schermo" />
          <ResultItem text="Dark mode funzionante" />
        </ResponsiveBox>
      </ResponsiveBox>
    </ScrollView>
  );
};

// Componente helper per test case
const TestCase: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <ResponsiveBox
    autoBackgroundColor="card"
    padding={16}
    style={{ borderRadius: 12, marginBottom: 20 }}
  >
    <FormattedText fontSize={16} fontWeight="bold" style={{ marginBottom: 4 }}>
      {title}
    </FormattedText>
    <FormattedText fontSize={14} style={{ color: '#666', marginBottom: 12 }}>
      {description}
    </FormattedText>
    <View
      style={{
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafafa',
      }}
    >
      {children}
    </View>
  </ResponsiveBox>
);

// Componente helper per risultati
const ResultItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    <FormattedText fontSize={16} style={{ marginRight: 8 }}>
      ✓
    </FormattedText>
    <FormattedText fontSize={14}>{text}</FormattedText>
  </View>
);
