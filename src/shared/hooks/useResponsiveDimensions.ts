/**
 * HOOK RESPONSIVE DIMENSIONS
 *
 * Traccia le dimensioni dello schermo e aggiorna automaticamente
 * quando l'utente ruota il device.
 *
 * PERCHÉ SERVE:
 * - Dimensions.get('window') è statico - non si aggiorna automaticamente
 * - Rotation portrait ↔ landscape cambia width/height
 * - Componenti devono ri-renderizzare con nuove dimensioni
 *
 * USO:
 * ```tsx
 * const { width, height } = useResponsiveDimensions();
 * const scaledValue = scaleWithDimensions(16, width, height);
 * ```
 */

import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ResponsiveDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

/**
 * Hook che traccia le dimensioni dello schermo
 * e si aggiorna automaticamente su rotation
 */
export const useResponsiveDimensions = (): ResponsiveDimensions => {
  // Inizializza con dimensioni correnti
  const [dimensions, setDimensions] = useState<ResponsiveDimensions>(() => {
    // eslint-disable-next-line no-restricted-properties
    const window = Dimensions.get('window');
    return {
      width: window.width,
      height: window.height,
      scale: window.scale,
      fontScale: window.fontScale,
    };
  });

  useEffect(() => {
    // Callback quando dimensioni cambiano
    const handleDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    };

    // Aggiungi listener
    const subscription = Dimensions.addEventListener(
      'change',
      handleDimensionsChange
    );

    // Cleanup: rimuovi listener quando componente unmount
    return () => {
      subscription?.remove();
    };
  }, []);

  return dimensions;
};

export default useResponsiveDimensions;
