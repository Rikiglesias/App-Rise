/**
 * C43 (contratto android-play): misura dell'area toccabile DICHIARATA di un controllo, sulle finestre
 * 360×640 e 320×568 dp. Sotto Jest non c'è impaginazione: conta ciò che il controllo garantisce da sé,
 * cioè il lato fisso o il minimo dello stile più il `hitSlop`. Il padding no: dipende dal contenuto.
 */
import { StyleSheet } from 'react-native';
import type { RenderResult } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { MIN_TOUCH_TARGET_DP } from '@/shared/utils/minimumTouchTarget';
import type { WindowSize } from '@/shared/utils/textScale';

/** Elemento ospite restituito dalle interrogazioni di Testing Library. */
export type Elemento = ReturnType<RenderResult['getByTestId']>;

export const FINESTRE_C43: readonly WindowSize[] = [
  { width: 360, height: 640 },
  { width: 320, height: 568 },
];

type Slop =
  | number
  | { top?: number; bottom?: number; left?: number; right?: number }
  | null
  | undefined;

const lato = (fisso: unknown, minimo: unknown): number => {
  const numeri = [fisso, minimo].filter(
    (v): v is number => typeof v === 'number'
  );
  return numeri.length ? Math.max(...numeri) : 0;
};

/** Larghezza e altezza toccabili dichiarate dall'elemento ospite del controllo. */
export const areaToccabile = (
  elemento: Elemento
): { larghezza: number; altezza: number } => {
  const stile = StyleSheet.flatten(elemento.props.style) ?? {};
  const slop = elemento.props.hitSlop as Slop;
  const s =
    typeof slop === 'number'
      ? { top: slop, bottom: slop, left: slop, right: slop }
      : (slop ?? {});
  return {
    larghezza:
      lato(stile.width, stile.minWidth) + (s.left ?? 0) + (s.right ?? 0),
    altezza:
      lato(stile.height, stile.minHeight) + (s.top ?? 0) + (s.bottom ?? 0),
  };
};

/**
 * Esegue `prova` con i moduli dell'app ricaricati come su un telefono Android della finestra data:
 * gli stili calcolati all'import (StyleSheet a livello di modulo, PerfectSpacing) prendono quella
 * misura, e PlatformTouchable segue il ramo Android. Dentro `prova` React, Testing Library e i
 * componenti vanno richiesti con `require`, dallo stesso registro.
 */
export const suTelefono = <T>(finestra: WindowSize, prova: () => T): T => {
  let esito: T | undefined;
  jest.isolateModules(() => {
    const RN = require('react-native') as typeof import('react-native');
    RN.Platform.OS = 'android';
    jest
      .spyOn(RN.Dimensions, 'get')
      .mockReturnValue({ ...finestra, scale: 2, fontScale: 1 });
    esito = prova();
  });
  jest.restoreAllMocks();
  return esito as T;
};

/** Le interrogazioni di Testing Library usate per trovare i controlli. */
export type Interrogazioni = Pick<
  RenderResult,
  'getByTestId' | 'getAllByTestId' | 'getAllByLabelText' | 'getAllByRole'
>;

export type Montaggio = {
  /** Elemento da montare, costruito coi moduli dello stesso registro (`require`). */
  elemento: () => ReactNode;
  /** Prima di misurare: per esempio un testo digitato che fa comparire i controlli. */
  prepara?: (
    ui: Interrogazioni & {
      fireEvent: { changeText: (elemento: Elemento, testo: string) => void };
    }
  ) => void;
  /** I controlli da misurare dentro l'albero montato. */
  trova: (ui: Interrogazioni) => Elemento | Elemento[];
};

export type Misura = {
  finestra: WindowSize;
  controllo: number;
  larghezza: number;
  altezza: number;
};

/** Monta su ciascuna finestra (tema chiaro, italiano, inset 0) e misura ogni controllo trovato. */
export const misuraSuTelefoni = (montaggio: Montaggio): Misura[] =>
  FINESTRE_C43.flatMap(finestra =>
    suTelefono(finestra, () => {
      const React = require('react') as typeof import('react');
      // `pure`: l'ingresso normale registra un afterAll, vietato dentro un test.
      const {
        fireEvent,
        render,
      } = require('@testing-library/react-native/pure');
      const { SafeAreaProvider } = require('react-native-safe-area-context');
      const { AllProviders } = require('./testProviders');
      require('@/locales').default.locale = 'it';
      const ui: RenderResult = render(
        React.createElement(
          SafeAreaProvider,
          {
            initialMetrics: {
              frame: { x: 0, y: 0, ...finestra },
              insets: { top: 0, left: 0, right: 0, bottom: 0 },
            },
          },
          React.createElement(AllProviders, null, montaggio.elemento())
        )
      );
      montaggio.prepara?.({ ...ui, fireEvent });
      const trovati = [montaggio.trova(ui)].flat();
      expect(trovati.length).toBeGreaterThan(0);
      const misure = trovati.map((el, controllo) => ({
        finestra,
        controllo,
        ...areaToccabile(el),
      }));
      ui.unmount();
      return misure;
    })
  );

/** Ogni misura ≥ 48 dp per lato; il messaggio porta finestra, controllo e misure. */
export const atteso48 = (misure: Misura[]): void => {
  for (const m of misure) {
    expect({
      ...m,
      larghezza: m.larghezza >= MIN_TOUCH_TARGET_DP - 1e-9,
      altezza: m.altezza >= MIN_TOUCH_TARGET_DP - 1e-9,
    }).toEqual({ ...m, larghezza: true, altezza: true });
  }
};
