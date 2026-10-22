import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

// Rapporto di contrasto WCAG 2.x fra due colori #RRGGBB.
const PESI = [0.2126, 0.7152, 0.0722];

const luminanza = (hex: string) =>
  PESI.reduce((somma, peso, i) => {
    const c = parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16) / 255;
    const lineare = c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return somma + peso * lineare;
  }, 0);

export const contrasto = (a: string, b: string): number => {
  const [la, lb] = [luminanza(a), luminanza(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Colore del testo di un nodo reso, dallo stile appiattito. */
export const coloreDi = (nodo: {
  props: { style?: StyleProp<TextStyle> };
}): string => String(StyleSheet.flatten(nodo.props.style)?.color);
