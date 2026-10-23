import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

// Rapporto di contrasto WCAG 2.x fra il colore di un testo e il fondo su cui sta.
type Rgb = [number, number, number];
type Rgba = [number, number, number, number];

// Legge #RRGGBB, #RRGGBBAA e rgb()/rgba(). Un formato sconosciuto ferma il test: prima le
// ultime due cifre di #RRGGBBAA venivano ignorate e il nero al 50% contava come nero pieno.
const leggi = (colore: string): Rgba => {
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(colore);
  const cifre = hex?.[1];
  if (cifre) {
    const canale = (i: number) => parseInt(cifre.slice(i, i + 2), 16);
    const alfa = hex[2] ? parseInt(hex[2], 16) / 255 : 1;
    return [canale(0), canale(2), canale(4), alfa];
  }
  const fn =
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      colore
    );
  if (fn) {
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), Number(fn[4] ?? 1)];
  }
  throw new Error(`colore non misurabile: ${colore}`);
};

const lineare = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminanza = ([r, g, b]: Rgb) =>
  0.2126 * lineare(r) + 0.7152 * lineare(g) + 0.0722 * lineare(b);

/** Un testo trasparente si misura per come appare: composto sul fondo, che deve essere pieno. */
export const contrasto = (testo: string, fondo: string): number => {
  const [fr, fg, fb, fa] = leggi(fondo);
  if (fa < 1) throw new Error(`fondo trasparente, non misurabile: ${fondo}`);
  const [tr, tg, tb, ta] = leggi(testo);
  const mescola = (t: number, f: number) => t * ta + f * (1 - ta);
  const visto: Rgb = [mescola(tr, fr), mescola(tg, fg), mescola(tb, fb)];
  const [la, lb] = [luminanza(visto), luminanza([fr, fg, fb])];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Colore del testo di un nodo reso, dallo stile appiattito (l'`opacity` del nodo non è letta). */
export const coloreDi = (nodo: {
  props: { style?: StyleProp<TextStyle> };
}): string => String(StyleSheet.flatten(nodo.props.style)?.color);
