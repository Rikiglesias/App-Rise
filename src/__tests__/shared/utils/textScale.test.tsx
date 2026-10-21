/**
 * C42 (contratto android-play): scala del testo come funzione pura, provata su 360×640 e 320×568 dp
 * con scala di sistema 1,0, 1,3 e 2,0. La grandezza a schermo è la dimensione data a <Text> per il
 * moltiplicatore che il sistema applica con le prop di SystemImmunity: i test la ricostruiscono da
 * quelle prop, così una soglia reintrodotta in SystemImmunity si vede anche se la funzione pura è giusta.
 */
import React from 'react';
import type { PixelRatio as PixelRatioType } from 'react-native';
import { render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthCityField } from '@/features/auth/components/AuthCityField';
import { AuthInput } from '@/features/auth/components/AuthInput';
import {
  MAX_FONT_SCALE,
  MIN_TEXT_SIZE,
  renderedTextSize,
  textFontSize,
  type WindowSize,
} from '@/shared/utils/textScale';

const FINESTRE: WindowSize[] = [
  { width: 360, height: 640 },
  { width: 320, height: 568 },
];
const SCALE_DI_SISTEMA = [1, 1.3, 2];
// Ogni grandezza di riferimento da 8 a 48: comprende tutte le `size` e i `fontSize` usati nell'app.
const GRANDEZZE = Array.from({ length: 41 }, (_, i) => i + 8);

type TextProps = { allowFontScaling?: boolean; maxFontSizeMultiplier?: number };

const propPerScala = new Map<number, TextProps>();

/** Prop dei testi come in produzione: senza il blocco che SystemImmunity applica sotto Jest. */
const propDeiTesti = (fontScale: number): TextProps => {
  const giàLette = propPerScala.get(fontScale);
  if (giàLette) return giàLette;
  const worker = process.env.JEST_WORKER_ID;
  delete process.env.JEST_WORKER_ID;
  let props: TextProps = {};
  try {
    jest.isolateModules(() => {
      const { PixelRatio } = jest.requireActual<{
        PixelRatio: typeof PixelRatioType;
      }>('react-native');
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(fontScale);
      const immunity = jest.requireActual<
        typeof import('@/shared/utils/SystemImmunity')
      >('@/shared/utils/SystemImmunity');
      props = immunity.getImmuneTextProps();
    });
  } finally {
    process.env.JEST_WORKER_ID = worker;
    jest.restoreAllMocks();
  }
  propPerScala.set(fontScale, props);
  return props;
};

/** Grandezza a schermo come la produce il sistema con le prop dei testi. */
const grandezzaAschermo = (
  size: number,
  finestra: WindowSize,
  fontScale: number
) => {
  const props = propDeiTesti(fontScale);
  const moltiplicatore = props.allowFontScaling
    ? Math.min(fontScale, props.maxFontSizeMultiplier ?? Infinity)
    : 1;
  return textFontSize(size, finestra) * moltiplicatore;
};

const noop = (): void => undefined;

describe('C42 scala del testo', () => {
  it('scala del testo: minimo 12 dp', () => {
    expect(MIN_TEXT_SIZE).toBe(12);
    for (const finestra of FINESTRE) {
      for (const fontScale of SCALE_DI_SISTEMA) {
        for (const size of GRANDEZZE) {
          const pura = renderedTextSize(size, finestra, fontScale);
          expect(pura).toBeGreaterThanOrEqual(12);
          expect(grandezzaAschermo(size, finestra, fontScale)).toBeCloseTo(
            pura,
            6
          );
        }
      }
    }
  });

  it('scala del testo: nessuna zona morta', () => {
    const passi = [1, 1.1, 1.2, 1.3];
    for (const finestra of FINESTRE) {
      for (const size of GRANDEZZE) {
        const viste = passi.map(s => grandezzaAschermo(size, finestra, s));
        for (let i = 1; i < viste.length; i++) {
          expect(viste[i]).toBeGreaterThan(viste[i - 1] as number);
        }
        const pure = passi.map(s => renderedTextSize(size, finestra, s));
        for (let i = 1; i < pure.length; i++) {
          expect(pure[i]).toBeGreaterThan(pure[i - 1] as number);
        }
      }
    }
  });

  it('scala del testo: tetto 2,0 anche sui campi', () => {
    expect(MAX_FONT_SCALE).toBe(2);
    for (const finestra of FINESTRE) {
      for (const size of GRANDEZZE) {
        const aDue = renderedTextSize(size, finestra, 2);
        expect(renderedTextSize(size, finestra, 3)).toBe(aDue);
        expect(grandezzaAschermo(size, finestra, 3)).toBeCloseTo(aDue, 6);
      }
    }
    expect(propDeiTesti(3).maxFontSizeMultiplier).toBe(2);

    const { getByLabelText } = render(
      <AllProviders>
        <AuthInput label="Email" value="" onChangeText={noop} />
        <AuthCityField
          label="Città"
          value=""
          country="IT"
          onChangeCity={noop}
          onSelectComune={noop}
        />
      </AllProviders>
    );
    for (const campo of ['Email', 'Città']) {
      const input = getByLabelText(campo);
      expect(input.props.allowFontScaling).toBe(true);
      expect(input.props.maxFontSizeMultiplier).toBe(2);
    }
  });
});
