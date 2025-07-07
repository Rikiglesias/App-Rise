/**
 * TABLET XL DEMONSTRATION - UNA RIGA NEL TEMA, TUTTO FUNZIONA
 * 
 * Dimostra come aggiungere `tabletXL: 1280` nel tema
 * fa automaticamente funzionare tutti i componenti migrati
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedText, ResponsiveBox, ResponsiveStack, ResponsiveCard } from '../components/ui';
import { useResponsiveLayout } from '../shared/hooks';
import { ResponsiveTheme } from '../shared/constants/responsiveTheme';

export const TabletXLDemonstrationExample: React.FC = () => {
  const { breakpoint, width } = useResponsiveLayout();
  
  return (
    <ResponsiveStack spacing={20} padding={20}>
      <FormattedText fontSize={32} fontWeight="bold" style={{ textAlign: 'center' }}>
        🚀 Tablet XL: Una Riga Nel Tema
      </FormattedText>
      
      {/* Current Breakpoint Info */}
      <ResponsiveBox backgroundColor="#F0F8FF" padding={16} style={{ borderRadius: 12 }}>
        <FormattedText fontSize={18} fontWeight="bold" color="#1E40AF">
          📱 Device Info
        </FormattedText>
        <FormattedText fontSize={16} style={{ marginTop: 8 }}>
          Width: {width}px
        </FormattedText>
        <FormattedText fontSize={16}>
          Breakpoint: <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>{breakpoint}</Text>
        </FormattedText>
        <FormattedText fontSize={14} color="#6B7280" style={{ marginTop: 8 }}>
          {breakpoint === 'tabletXL' ? '✅ Tablet XL Active!' : '⏳ Resize to 1280+ px to see Tablet XL'}
        </FormattedText>
      </ResponsiveBox>
      
      {/* Automatic Layout Changes */}
      <ResponsiveBox>
        <FormattedText fontSize={20} fontWeight="bold" style={{ marginBottom: 16 }}>
          🎯 Automatic Layout Changes
        </FormattedText>
        
        <ResponsiveStack direction="horizontal" spacing={12} style={{ flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <ResponsiveCard key={num} preset="card" padding={16} elevated>
              <FormattedText fontSize={16} fontWeight="bold" style={{ textAlign: 'center' }}>
                Card {num}
              </FormattedText>
              <FormattedText fontSize={12} color="#6B7280" style={{ textAlign: 'center', marginTop: 4 }}>
                Width: {ResponsiveTheme.layout.cardWidth[breakpoint]}
              </FormattedText>
            </ResponsiveCard>
          ))}
        </ResponsiveStack>
      </ResponsiveBox>
      
      {/* Responsive Modal Preview */}
      <ResponsiveBox>
        <FormattedText fontSize={20} fontWeight="bold" style={{ marginBottom: 16 }}>
          📱 Modal Responsive Preview
        </FormattedText>
        
        <ResponsiveBox 
          preset="modal" 
          backgroundColor="#F8F9FA" 
          padding={20}
          style={{ 
            borderRadius: 12, 
            borderWidth: 2, 
            borderColor: '#E9ECEF',
            borderStyle: 'dashed' 
          }}
        >
          <FormattedText fontSize={16} style={{ textAlign: 'center' }}>
            Modal Width: {ResponsiveTheme.layout.modalWidth[breakpoint]}
          </FormattedText>
          <FormattedText fontSize={14} color="#6B7280" style={{ textAlign: 'center', marginTop: 8 }}>
            Automatically adapts to {breakpoint} breakpoint
          </FormattedText>
        </ResponsiveBox>
      </ResponsiveBox>
      
      {/* Breakpoint Comparison Table */}
      <ResponsiveBox>
        <FormattedText fontSize={20} fontWeight="bold" style={{ marginBottom: 16 }}>
          📊 Breakpoint Comparison
        </FormattedText>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Breakpoint</Text>
            <Text style={styles.tableHeaderText}>Width Range</Text>
            <Text style={styles.tableHeaderText}>Card Width</Text>
            <Text style={styles.tableHeaderText}>Modal Width</Text>
          </View>
          
          {[
            { name: 'Standard', range: '376-414px', card: '47.5%', modal: '90%' },
            { name: 'XLarge', range: '481-600px', card: '31%', modal: '70%' },
            { name: 'XXLarge', range: '601-1279px', card: '23%', modal: '60%' },
            { name: 'Tablet XL', range: '1280-1439px', card: '20%', modal: '50%' },
            { name: 'Desktop', range: '1440+px', card: '20%', modal: '50%' },
          ].map((row, _index) => (
            <View 
              key={row.name} 
              style={[
                styles.tableRow,
                row.name.toLowerCase().replace(' ', '') === breakpoint.toLowerCase() && styles.activeRow
              ]}
            >
              <Text style={styles.tableCell}>{row.name}</Text>
              <Text style={styles.tableCell}>{row.range}</Text>
              <Text style={styles.tableCell}>{row.card}</Text>
              <Text style={styles.tableCell}>{row.modal}</Text>
            </View>
          ))}
        </View>
      </ResponsiveBox>
      
      {/* Implementation Code */}
      <ResponsiveBox backgroundColor="#1F2937" padding={16} style={{ borderRadius: 12 }}>
        <FormattedText fontSize={16} fontWeight="bold" color="#F9FAFB" style={{ marginBottom: 12 }}>
          💡 Implementation: One Line in Theme
        </FormattedText>
        <Text style={styles.codeText}>
          {`// responsiveTheme.ts
export const ResponsiveBreakpoints = {
  // ... existing breakpoints ...
  tabletXL: 1280, // ← ONE LINE ADDED
};

export const ResponsiveLayout = {
  cardWidth: {
    // ... existing widths ...
    tabletXL: '20%', // ← AUTO-ADAPTS
  },
  modalWidth: {
    // ... existing widths ...
    tabletXL: '50%', // ← AUTO-ADAPTS
  },
};`}
        </Text>
        
        <FormattedText fontSize={14} color="#10B981" style={{ marginTop: 12 }}>
          ✨ Result: ALL migrated components automatically support Tablet XL!
        </FormattedText>
      </ResponsiveBox>
      
      {/* Benefits Summary */}
      <ResponsiveBox backgroundColor="#F0FDF4" padding={16} style={{ borderRadius: 12 }}>
        <FormattedText fontSize={18} fontWeight="bold" color="#059669" style={{ marginBottom: 12 }}>
          🎉 Benefits Achieved
        </FormattedText>
        
        <ResponsiveStack spacing={8}>
          <BenefitItem 
            icon="🎯" 
            text="Zero code changes in components" 
          />
          <BenefitItem 
            icon="⚡" 
            text="Automatic layout adaptation" 
          />
          <BenefitItem 
            icon="📱" 
            text="Responsive cards: 47.5% → 31% → 23% → 20%" 
          />
          <BenefitItem 
            icon="🖥️" 
            text="Responsive modals: 90% → 70% → 60% → 50%" 
          />
          <BenefitItem 
            icon="🚀" 
            text="Future-proof for more breakpoints" 
          />
        </ResponsiveStack>
      </ResponsiveBox>
    </ResponsiveStack>
  );
};

// Helper Component
interface BenefitItemProps {
  icon: string;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <FormattedText fontSize={14} color="#065F46" style={{ flex: 1 }}>
      {text}
    </FormattedText>
  </View>
);

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  activeRow: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#E5E7EB',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 6,
    lineHeight: 16,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  benefitIcon: {
    fontSize: 16,
    marginRight: 8,
  },
}); 