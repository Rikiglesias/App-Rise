/**
 * GRID OVERLAY - DEBUG COMPONENT
 *
 * Overlay di debug per visualizzare la griglia 8dp baseline
 * durante lo sviluppo. Attivabile con ⌘G (Cmd+G).
 *
 * Features:
 * - Griglia 8dp baseline universale
 * - Toggle con keyboard shortcut
 * - Zero impatto su performance in produzione
 * - Supporto cross-platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { PerfectText } from '../../components/ui/PerfectText';

const GRID_SIZE = 8; // 8dp baseline grid
const GRID_COLOR = 'rgba(255, 0, 0, 0.15)'; // Rosso semi-trasparente
const GRID_BORDER_COLOR = 'rgba(255, 0, 0, 0.3)'; // Rosso più opaco per le linee

interface GridOverlayProps {
  visible?: boolean;
  onToggle?: (visible: boolean) => void;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  visible = false,
  onToggle,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  // iPhone 15 reference dimensions - Perfect System handles scaling
  const screenDimensions = { width: 393, height: 852 };

  useEffect(() => {
    // No need to listen for dimension changes in Perfect System
    // Perfect System uses fixed iPhone 15 reference dimensions
  }, []);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const toggleVisibility = useCallback(() => {
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    onToggle?.(newVisible);
  }, [isVisible, onToggle]);

  useEffect(() => {
    if (!__DEV__) return; // Solo in development

    const handleKeyPress = (event: KeyboardEvent) => {
      // ⌘G (Cmd+G) per toggle
      if (event.metaKey && event.key === 'g') {
        event.preventDefault();
        toggleVisibility();
      }
    };

    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }

    // Return undefined per platform non-web (evita errore TypeScript)
    return undefined;
  }, [isVisible, toggleVisibility]); // ✅ Aggiunta dependency mancante

  if (!__DEV__ || !isVisible) return null;

  const renderGrid = () => {
    const { width, height } = screenDimensions;
    const rows = Math.ceil(height / GRID_SIZE);
    const cols = Math.ceil(width / GRID_SIZE);

    const gridLines = [];

    // Linee orizzontali
    for (let i = 0; i <= rows; i++) {
      gridLines.push(
        <View
          key={`h-${i}`}
          style={[styles.horizontalLine, { top: i * GRID_SIZE, width: width }]}
        />
      );
    }

    // Linee verticali
    for (let i = 0; i <= cols; i++) {
      gridLines.push(
        <View
          key={`v-${i}`}
          style={[styles.verticalLine, { left: i * GRID_SIZE, height: height }]}
        />
      );
    }

    return gridLines;
  };

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <PerfectText size={12} lines={1} style={styles.infoText}>
        8dp Grid | ⌘G to toggle
      </PerfectText>
    </View>
  );

  return (
    <View style={styles.overlay} pointerEvents="none">
      {renderGrid()}
      {renderInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: GRID_COLOR,
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: GRID_BORDER_COLOR,
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: GRID_BORDER_COLOR,
  },
  infoContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

/**
 * Hook per gestire GridOverlay
 */
export const useGridOverlay = () => {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible(!visible);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return {
    visible,
    toggle,
    show,
    hide,
    GridOverlay: (props: Omit<GridOverlayProps, 'visible' | 'onToggle'>) => (
      <GridOverlay {...props} visible={visible} onToggle={setVisible} />
    ),
  };
};

export default GridOverlay;
