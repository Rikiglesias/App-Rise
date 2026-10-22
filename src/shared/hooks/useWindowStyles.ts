import { useMemo } from 'react';
import { useWindowDimensions, type ScaledSize } from 'react-native';

const perFinestra = <T>(create: () => T, _finestra: ScaledSize): T => create();

/**
 * Stili senza colori costruiti con `scale()`, ricalcolati quando cambia la finestra (C54 del contratto
 * android-play): `useMemo(() => createStyles(), [])` li lasciava alla misura del primo disegno.
 * Con i colori del tema basta `useMemo(..., [colors])`: `useThemeColors` cambia già con la finestra.
 */
export const useWindowStyles = <T>(create: () => T): T => {
  const finestra = useWindowDimensions();
  return useMemo(() => perFinestra(create, finestra), [create, finestra]);
};
