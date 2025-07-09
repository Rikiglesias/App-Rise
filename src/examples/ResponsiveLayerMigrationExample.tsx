/**
 * RESPONSIVE LAYER MIGRATION EXAMPLES
 *
 * Dimostra come il layer centralizzato elimina frammentazione di:
 * - Breakpoints duplicati
 * - Percentuali hard-coded
 * - Calcoli manuali ripetuti
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  FormattedText,
  ResponsiveBox,
  ResponsiveStack,
  ResponsiveCard,
} from '../components/ui';

const { width: screenWidth } = Dimensions.get('window');

export const ResponsiveLayerMigrationExample: React.FC = () => {
  return (
    <ResponsiveStack spacing={24} padding={20}>
      <FormattedText fontSize={28} fontWeight="bold">
        🎯 Layer Centralizzato: Prima vs Dopo
      </FormattedText>

      {/* ESEMPIO 1: Card Layout */}
      <BeforeAfterSection
        title="1. Card Layout - Elimina Frammentazione"
        beforeComponent={<OldCardLayout />}
        afterComponent={<NewCardLayout />}
      />

      {/* ESEMPIO 2: Modal Width */}
      <BeforeAfterSection
        title="2. Modal Width - Elimina Hard-coding"
        beforeComponent={<OldModalWidth />}
        afterComponent={<NewModalWidth />}
      />

      {/* ESEMPIO 3: Responsive Actions */}
      <BeforeAfterSection
        title="3. Actions Grid - Unifica Breakpoints"
        beforeComponent={<OldActionsGrid />}
        afterComponent={<NewActionsGrid />}
      />

      {/* ESEMPIO 4: Future Benefits */}
      <FutureBenefitsSection />
    </ResponsiveStack>
  );
};

// =================================================================
// BEFORE: OLD SYSTEM - FRAMMENTATO
// =================================================================

const OldCardLayout: React.FC = () => {
  // ❌ PROBLEMA: Breakpoint duplicato (trovato in 3+ componenti)
  const isTablet = screenWidth >= 768;
  const cardWidth = isTablet ? '31%' : '47.5%';

  return (
    <View style={styles.problemSection}>
      <FormattedText fontSize={16} color="#DC2626">
        ❌ PRIMA: Frammentato
      </FormattedText>
      <Text style={styles.codeText}>
        {`const isTablet = screenWidth >= 768;
const cardWidth = isTablet ? '31%' : '47.5%';`}
      </Text>
      <View style={[styles.card, { width: cardWidth }]}>
        <FormattedText fontSize={14}>
          Card con breakpoint duplicato
        </FormattedText>
      </View>
    </View>
  );
};

const OldModalWidth: React.FC = () => {
  // ❌ PROBLEMA: Calcolo manuale ripetuto
  const modalWidth = screenWidth * 0.9;

  return (
    <View style={styles.problemSection}>
      <FormattedText fontSize={16} color="#DC2626">
        ❌ PRIMA: Hard-coded
      </FormattedText>
      <Text style={styles.codeText}>
        {`maxWidth: screenWidth * 0.9,  // Ripetuto ovunque`}
      </Text>
      <View style={[styles.modal, { maxWidth: modalWidth }]}>
        <FormattedText fontSize={14}>Modal con calcolo duplicato</FormattedText>
      </View>
    </View>
  );
};

const OldActionsGrid: React.FC = () => {
  // ❌ PROBLEMA: Percentuali sparse e inconsistenti
  return (
    <View style={styles.problemSection}>
      <FormattedText fontSize={16} color="#DC2626">
        ❌ PRIMA: Inconsistente
      </FormattedText>
      <Text style={styles.codeText}>
        {`width: '48%'    // ImpactQuickStats
width: '60%'    // SeguiciScreen  
width: '80%'    // HeaderDivider`}
      </Text>
      <View style={styles.gridContainer}>
        <View style={[styles.gridItem, { width: '48%' }]}>
          <FormattedText fontSize={12}>48%</FormattedText>
        </View>
        <View style={[styles.gridItem, { width: '60%' }]}>
          <FormattedText fontSize={12}>60%</FormattedText>
        </View>
        <View style={[styles.gridItem, { width: '80%' }]}>
          <FormattedText fontSize={12}>80%</FormattedText>
        </View>
      </View>
    </View>
  );
};

// =================================================================
// AFTER: NEW SYSTEM - CENTRALIZZATO
// =================================================================

const NewCardLayout: React.FC = () => {
  return (
    <View style={styles.solutionSection}>
      <FormattedText fontSize={16} color="#059669">
        ✅ DOPO: Centralizzato
      </FormattedText>
      <Text style={styles.codeText}>
        {`<ResponsiveCard preset="card">
  Card con breakpoint unificato
</ResponsiveCard>`}
      </Text>
      <ResponsiveCard preset="card" padding={16} elevated>
        <FormattedText fontSize={14}>
          Card con breakpoint unificato
        </FormattedText>
      </ResponsiveCard>
    </View>
  );
};

const NewModalWidth: React.FC = () => {
  return (
    <View style={styles.solutionSection}>
      <FormattedText fontSize={16} color="#059669">
        ✅ DOPO: Token-based
      </FormattedText>
      <Text style={styles.codeText}>
        {`<ResponsiveBox preset="modal">
  Modal con width dal tema
</ResponsiveBox>`}
      </Text>
      <ResponsiveBox preset="modal" backgroundColor="#F8F8F8" padding={16}>
        <FormattedText fontSize={14}>Modal con width dal tema</FormattedText>
      </ResponsiveBox>
    </View>
  );
};

const NewActionsGrid: React.FC = () => {
  return (
    <View style={styles.solutionSection}>
      <FormattedText fontSize={16} color="#059669">
        ✅ DOPO: Consistente
      </FormattedText>
      <Text style={styles.codeText}>
        {`width={{ compact:'100%', standard:'47.5%', xlarge:'31%' }}`}
      </Text>
      <ResponsiveStack direction="horizontal" spacing={8}>
        <ResponsiveBox
          width={{ compact: '100%', standard: '30%', xlarge: '30%' }}
          backgroundColor="#E5F3FF"
          padding={8}
        >
          <FormattedText fontSize={12}>Consistente</FormattedText>
        </ResponsiveBox>
        <ResponsiveBox
          width={{ compact: '100%', standard: '30%', xlarge: '30%' }}
          backgroundColor="#E5F3FF"
          padding={8}
        >
          <FormattedText fontSize={12}>Unificato</FormattedText>
        </ResponsiveBox>
        <ResponsiveBox
          width={{ compact: '100%', standard: '30%', xlarge: '30%' }}
          backgroundColor="#E5F3FF"
          padding={8}
        >
          <FormattedText fontSize={12}>Scalabile</FormattedText>
        </ResponsiveBox>
      </ResponsiveStack>
    </View>
  );
};

// =================================================================
// FUTURE BENEFITS SECTION
// =================================================================

const FutureBenefitsSection: React.FC = () => {
  return (
    <ResponsiveBox
      backgroundColor="#F0FDF4"
      padding={20}
      style={{ borderRadius: 12 }}
    >
      <FormattedText fontSize={20} fontWeight="bold" color="#059669">
        🚀 Benefici Futuri - Una Riga nel Tema
      </FormattedText>

      <ResponsiveStack spacing={16}>
        <BenefitItem
          title="Tablet XL (≥1280dp)"
          description="Una riga nei breakpoints → layout 3-4 colonne automatico"
          code="tabletXL: 1280, // Nuovo breakpoint"
        />

        <BenefitItem
          title="Dark Mode Unificato"
          description="Toggle centrale → tutti i componenti si aggiornano"
          code="setColorMode('dark'); // TUTTI i Box/Text"
        />

        <BenefitItem
          title="RTL Support"
          description="Flag globale → flexDirection e textAlign automatici"
          code="<Stack flexDirection={isRTL ? 'row-reverse' : 'row'} />"
        />

        <BenefitItem
          title="Re-branding"
          description="Colori nel tema → zero trova & sostituisci"
          code="primary:'#5E60CE', // Una edit, tutto cambia"
        />
      </ResponsiveStack>

      <FormattedText
        fontSize={16}
        fontWeight="bold"
        color="#059669"
        style={{ marginTop: 16 }}
      >
        💡 Da centinaia di edit manuali → Una riga nel tema!
      </FormattedText>
    </ResponsiveBox>
  );
};

// =================================================================
// HELPER COMPONENTS
// =================================================================

interface BeforeAfterSectionProps {
  title: string;
  beforeComponent: React.ReactNode;
  afterComponent: React.ReactNode;
}

const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({
  title,
  beforeComponent,
  afterComponent,
}) => (
  <ResponsiveBox>
    <FormattedText fontSize={18} fontWeight="bold" style={{ marginBottom: 12 }}>
      {title}
    </FormattedText>
    <ResponsiveStack direction="horizontal" spacing={12}>
      <ResponsiveBox flex={1}>{beforeComponent}</ResponsiveBox>
      <ResponsiveBox flex={1}>{afterComponent}</ResponsiveBox>
    </ResponsiveStack>
  </ResponsiveBox>
);

interface BenefitItemProps {
  title: string;
  description: string;
  code: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({
  title,
  description,
  code,
}) => (
  <ResponsiveBox>
    <FormattedText fontSize={16} fontWeight="bold" color="#059669">
      {title}
    </FormattedText>
    <FormattedText fontSize={14} color="#374151" style={{ marginVertical: 4 }}>
      {description}
    </FormattedText>
    <Text style={styles.codeTextSmall}>{code}</Text>
  </ResponsiveBox>
);

// =================================================================
// STYLES
// =================================================================

const styles = StyleSheet.create({
  problemSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  solutionSection: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
    color: '#374151',
  },

  codeTextSmall: {
    fontFamily: 'monospace',
    fontSize: 11,
    backgroundColor: '#F8F8F8',
    padding: 6,
    borderRadius: 4,
    color: '#6B7280',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  modal: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  gridItem: {
    backgroundColor: '#E5E7EB',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
});
