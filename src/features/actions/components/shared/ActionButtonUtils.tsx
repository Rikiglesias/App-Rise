import React from 'react';
import type { SectionDividerProps } from './ActionButtonTypes';
import { PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants';

// Helper function per determinare i colori delle icone della sezione Esplora
export const getExploreIconColor = (index: number): string => {
  if (index === 0) return Colors.gradients.projects[0]; // Teal per Progetti
  if (index === 1) return Colors.gradients.tracking[0]; // Blu per Tracciabilità
  return Colors.gradients.events[0]; // Viola per Eventi
};

// Helper function per determinare i colori delle icone della sezione Community
export const getCommunityIconColor = (index: number): string => {
  if (index === 0) return Colors.gradients.community[0]; // Dark gray per Seguici
  return Colors.gradients.community[0]; // Dark gray per Chi Siamo
};

// Componente divisore semplice per separare le sezioni
export const SectionDivider: React.FC<SectionDividerProps> = ({ styles }) => (
  <PerfectContainer style={styles.sectionDivider} />
);

// Componente prima linea più grossa
export const FirstSectionDivider: React.FC<SectionDividerProps> = ({
  styles,
}) => <PerfectContainer style={styles.firstSectionDivider} />;
