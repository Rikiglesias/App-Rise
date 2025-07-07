import React from 'react';
import { View } from 'react-native';
import type { SectionDividerProps } from './ActionButtonTypes';

// Helper function per determinare i colori delle icone della sezione Esplora
export const getExploreIconColor = (index: number): string => {
  if (index === 0) return '#0F766E'; // Teal per Progetti
  if (index === 1) return '#1565C0'; // Blu per Tracciabilità
  return '#7C3AED'; // Viola per Eventi
};

// Helper function per determinare i colori delle icone della sezione Community
export const getCommunityIconColor = (index: number): string => {
  if (index === 0) return '#1F2937'; // Nero per Seguici
  return '#1F2937'; // Grigio scuro per Chi Siamo
};

// Componente divisore semplice per separare le sezioni
export const SectionDivider: React.FC<SectionDividerProps> = ({ styles }) => (
  <View style={styles.sectionDivider} />
);

// Componente prima linea più grossa
export const FirstSectionDivider: React.FC<SectionDividerProps> = ({
  styles,
}) => <View style={styles.firstSectionDivider} />;
