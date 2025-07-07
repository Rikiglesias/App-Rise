/**
 * DARK MODE UNIFIED DEMONSTRATION
 * 
 * Dimostra come il toggle centrale dark mode aggiorna
 * automaticamente tutti i componenti ResponsiveBox
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { FormattedText, ResponsiveBox, ResponsiveStack, ResponsiveCard } from '../components/ui';
import { useResponsiveDarkMode } from '../shared/hooks/useResponsiveDarkMode';
import { ResponsiveDarkModeProvider } from '../shared/context/ResponsiveDarkModeProvider';

// Demo content component
const DarkModeDemoContent: React.FC = () => {
  const { 
    isDark, 
    toggleDarkMode, 
    backgroundColor, 
    textColor,
    borderColor,
    colorMode 
  } = useResponsiveDarkMode();

  return (
    <ScrollView style={[styles.container, { backgroundColor: backgroundColor.primary }]}>
      <ResponsiveStack spacing={20} padding={20}>
        
        {/* Header with Toggle */}
        <ResponsiveBox autoBackgroundColor="secondary" padding={20} style={styles.header}>
          <FormattedText 
            fontSize={24} 
            fontWeight="bold" 
            style={{ color: textColor.primary, textAlign: 'center' }}
          >
            🌓 Dark Mode Unificato
          </FormattedText>
          
          <FormattedText 
            fontSize={16} 
            style={{ color: textColor.secondary, textAlign: 'center', marginTop: 8 }}
          >
            Modalità corrente: <FormattedText fontWeight="bold" style={{ color: textColor.primary }}>
              {isDark ? 'Dark' : 'Light'}
            </FormattedText>
          </FormattedText>
          
          <ResponsiveBox 
            style={{
              ...styles.toggleButton, 
              backgroundColor: isDark ? '#3B82F6' : '#DC2626',
              borderColor: borderColor.accent 
            }}
            // Mock onPress per dimostrare il toggle
            onTouchEnd={toggleDarkMode}
          >
            <FormattedText 
              fontSize={16} 
              fontWeight="bold" 
              style={{ color: '#FFFFFF', textAlign: 'center' }}
            >
              {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </FormattedText>
          </ResponsiveBox>
        </ResponsiveBox>

        {/* Automatic Color Cards */}
        <ResponsiveBox>
          <FormattedText 
            fontSize={20} 
            fontWeight="bold" 
            style={{ color: textColor.primary, marginBottom: 16 }}
          >
            🎨 Automatic Color Updates
          </FormattedText>
          
          <ResponsiveStack direction="horizontal" spacing={12} style={{ flexWrap: 'wrap' }}>
            
            {/* Primary Background Card */}
            <ResponsiveCard 
              autoBackgroundColor="primary"
              padding={16} 
              style={{
                ...styles.colorCard, 
                borderColor: borderColor.primary 
              }}
            >
              <FormattedText 
                fontSize={16} 
                fontWeight="bold" 
                style={{ color: textColor.primary, textAlign: 'center' }}
              >
                Primary BG
              </FormattedText>
              <FormattedText 
                fontSize={12} 
                style={{ color: textColor.secondary, textAlign: 'center', marginTop: 4 }}
              >
                Auto: {backgroundColor.primary}
              </FormattedText>
            </ResponsiveCard>

            {/* Secondary Background Card */}
            <ResponsiveCard 
              autoBackgroundColor="secondary"
              padding={16} 
              style={{
                ...styles.colorCard, 
                borderColor: borderColor.primary 
              }}
            >
              <FormattedText 
                fontSize={16} 
                fontWeight="bold" 
                style={{ color: textColor.primary, textAlign: 'center' }}
              >
                Secondary BG
              </FormattedText>
              <FormattedText 
                fontSize={12} 
                style={{ color: textColor.secondary, textAlign: 'center', marginTop: 4 }}
              >
                Auto: {backgroundColor.secondary}
              </FormattedText>
            </ResponsiveCard>

            {/* Card Background */}
            <ResponsiveCard 
              autoBackgroundColor="card"
              padding={16} 
              style={{
                ...styles.colorCard, 
                borderColor: borderColor.primary 
              }}
            >
              <FormattedText 
                fontSize={16} 
                fontWeight="bold" 
                style={{ color: textColor.primary, textAlign: 'center' }}
              >
                Card BG
              </FormattedText>
              <FormattedText 
                fontSize={12} 
                style={{ color: textColor.secondary, textAlign: 'center', marginTop: 4 }}
              >
                Auto: {backgroundColor.card}
              </FormattedText>
            </ResponsiveCard>

            {/* Modal Background */}
            <ResponsiveCard 
              autoBackgroundColor="modal"
              padding={16} 
              style={{
                ...styles.colorCard, 
                borderColor: borderColor.primary 
              }}
            >
              <FormattedText 
                fontSize={16} 
                fontWeight="bold" 
                style={{ color: textColor.primary, textAlign: 'center' }}
              >
                Modal BG
              </FormattedText>
              <FormattedText 
                fontSize={12} 
                style={{ color: textColor.secondary, textAlign: 'center', marginTop: 4 }}
              >
                Auto: {backgroundColor.modal}
              </FormattedText>
            </ResponsiveCard>

          </ResponsiveStack>
        </ResponsiveBox>

        {/* Benefits Section */}
        <ResponsiveBox autoBackgroundColor="card" padding={20} style={styles.benefitsSection}>
          <FormattedText 
            fontSize={18} 
            fontWeight="bold" 
            style={{ color: textColor.primary, marginBottom: 12 }}
          >
            ✨ Benefici Ottenuti
          </FormattedText>
          
          <ResponsiveStack spacing={8}>
            <BenefitItem 
              icon="🎯" 
              text="Una sola toggle → tutti i componenti si aggiornano"
            />
            <BenefitItem 
              icon="🔄" 
              text="Automatic color resolution (light/dark)"
            />
            <BenefitItem 
              icon="🎨" 
              text="Consistent theming across app"
            />
            <BenefitItem 
              icon="⚡" 
              text="Zero manual color management"
            />
            <BenefitItem 
              icon="🚀" 
              text="Works with all ResponsiveBox components"
            />
          </ResponsiveStack>
        </ResponsiveBox>

        {/* Implementation Code */}
        <ResponsiveBox 
          backgroundColor={isDark ? '#1F2937' : '#F8F9FA'} 
          padding={16} 
          style={styles.codeSection}
        >
          <FormattedText 
            fontSize={16} 
            fontWeight="bold" 
            style={{ color: isDark ? '#F9FAFB' : '#1F2937', marginBottom: 12 }}
          >
            💡 Implementation
          </FormattedText>
          
          <FormattedText 
            fontSize={12} 
            style={{ 
              color: isDark ? '#E5E7EB' : '#374151',
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
              padding: 12,
              borderRadius: 6,
              fontFamily: 'monospace'
            }}
          >
{`// One toggle updates everything:
const { toggleDarkMode } = useResponsiveDarkMode();

// Automatic colors:
<ResponsiveBox autoBackgroundColor="primary">
<ResponsiveBox autoBackgroundColor="card">
<ResponsiveBox autoBackgroundColor="modal">

// Result: ${backgroundColor.primary} → ${isDark ? '#0C0C0E' : '#FFFFFF'}`}
          </FormattedText>
        </ResponsiveBox>

        {/* Current State Display */}
        <ResponsiveBox 
          autoBackgroundColor="secondary" 
          padding={16} 
          style={styles.stateSection}
        >
          <FormattedText 
            fontSize={16} 
            fontWeight="bold" 
            style={{ color: textColor.primary, marginBottom: 8 }}
          >
            📊 Current State
          </FormattedText>
          
          <ResponsiveStack spacing={4}>
            <StateItem label="Color Mode" value={colorMode} />
            <StateItem label="Is Dark" value={isDark.toString()} />
            <StateItem label="Background Primary" value={backgroundColor.primary} />
            <StateItem label="Text Primary" value={textColor.primary} />
            <StateItem label="Border Accent" value={borderColor.accent} />
          </ResponsiveStack>
        </ResponsiveBox>

      </ResponsiveStack>
    </ScrollView>
  );
};

// Helper Components
interface BenefitItemProps {
  icon: string;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => {
  const { textColor } = useResponsiveDarkMode();
  
  return (
    <View style={styles.benefitItem}>
      <FormattedText fontSize={16}>{icon}</FormattedText>
      <FormattedText 
        fontSize={14} 
        style={{ color: textColor.secondary, flex: 1, marginLeft: 8 }}
      >
        {text}
      </FormattedText>
    </View>
  );
};

interface StateItemProps {
  label: string;
  value: string;
}

const StateItem: React.FC<StateItemProps> = ({ label, value }) => {
  const { textColor } = useResponsiveDarkMode();
  
  return (
    <View style={styles.stateItem}>
      <FormattedText 
        fontSize={12} 
        style={{ color: textColor.secondary, flex: 1 }}
      >
        {label}:
      </FormattedText>
      <FormattedText 
        fontSize={12} 
        fontWeight="bold"
        style={{ color: textColor.primary }}
      >
        {value}
      </FormattedText>
    </View>
  );
};

// Main export with provider
export const DarkModeUnifiedExample: React.FC = () => (
  <ResponsiveDarkModeProvider>
    <DarkModeDemoContent />
  </ResponsiveDarkModeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    borderRadius: 12,
    alignItems: 'center',
  },
  
  toggleButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  
  colorCard: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '45%',
  },
  
  benefitsSection: {
    borderRadius: 12,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  codeSection: {
    borderRadius: 12,
  },
  
  stateSection: {
    borderRadius: 12,
  },
  
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 