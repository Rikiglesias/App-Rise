import React from 'react';
import { View } from 'react-native';

import { actionButtonsStyles } from '../styles/ActionButtonsStyles';

/**
 * Componente divisore semplice per separare le sezioni
 */
export const SectionDivider: React.FC = () => (
  <View style={actionButtonsStyles.sectionDivider} />
);

/**
 * Componente prima linea più grossa
 */
export const FirstSectionDivider: React.FC = () => (
  <View style={actionButtonsStyles.firstSectionDivider} />
);
