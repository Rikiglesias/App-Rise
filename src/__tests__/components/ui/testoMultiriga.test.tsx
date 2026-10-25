/**
 * C58 (contratto android-play): `PerfectText` con una larghezza (automatica su più righe o
 * `containerWidth` > 0) non si dà più una `width` fissa centrata, che in un contenitore stretto
 * usciva dai bordi: avvolge il testo in `{ width: '100%', maxWidth: <larghezza di oggi>,
 * flexShrink: 1, alignSelf: 'center' }`. In un contenitore largo resta identico a prima.
 * `containerWidth={0}` spegne la larghezza anche col testo di sistema ingrandito.
 *
 * Jest non ha un motore di impaginazione: `larghezzaEffettiva` risolve le sole regole che
 * servono qui (percentuale del contenitore, `maxWidth`, restringimento in una riga).
 */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { renderWithProviders } from '../../helpers/testProviders';
import { PerfectText } from '../../../components/ui/PerfectText';
import {
  LOGICAL_REFERENCE,
  scaleWithDimensions,
} from '../../../shared/constants/perfectScale';

type Stile = {
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  flexShrink?: number;
  alignSelf?: string;
};

const TESTO =
  'Un testo abbastanza lungo da andare a capo su più righe nella scheda';

/** Larghezza che `PerfectText` si dava prima di C58, sulla finestra del test. */
const larghezzaDiOggi = (riferimento: number): number => {
  const { width, height } = Dimensions.get('window');
  return scaleWithDimensions(riferimento, width, height);
};
const AUTOMATICA = LOGICAL_REFERENCE.width * 0.7;

const misura = (valore: number | string | undefined, contenitore: number) => {
  if (typeof valore === 'number') return valore;
  if (typeof valore === 'string' && valore.endsWith('%'))
    return (contenitore * parseFloat(valore)) / 100;
  return undefined;
};

/** Larghezza del contenitore del testo dentro uno spazio largo `contenitore`. */
const larghezzaEffettiva = (stile: Stile, contenitore: number): number => {
  let w = misura(stile.width, contenitore) ?? contenitore;
  const max = misura(stile.maxWidth, contenitore);
  if (max !== undefined) w = Math.min(w, max);
  const min = misura(stile.minWidth, contenitore);
  if (min !== undefined) w = Math.max(w, min);
  return w;
};

/** In una riga: con `flexShrink` cede fino allo spazio rimasto, senza resta com'è. */
const larghezzaInRiga = (stile: Stile, spazioRimasto: number): number => {
  const w = larghezzaEffettiva(stile, spazioRimasto);
  return (stile.flexShrink ?? 0) > 0 ? Math.min(w, spazioRimasto) : w;
};

type Albero = ReturnType<ReturnType<typeof render>['toJSON']>;
type Nodo = Exclude<Albero, unknown[] | null>;

const albero = (ui: Albero): Nodo | null =>
  Array.isArray(ui) ? (ui[0] ?? null) : ui;

/** Stile del contenitore che `PerfectText` mette attorno al testo (radice del suo albero). */
const stileDelContenitore = (elemento: React.ReactElement): Stile => {
  const radice = albero(renderWithProviders(elemento, render).toJSON());
  expect(radice?.type).toBe('View');
  return (StyleSheet.flatten(radice?.props.style) ?? {}) as Stile;
};

describe('PerfectText su più righe (C58)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('testo multiriga: mai più largo del contenitore', () => {
    const casi = [
      {
        elemento: (
          <PerfectText size={14} lines={2}>
            {TESTO}
          </PerfectText>
        ),
        rif: AUTOMATICA,
      },
      {
        elemento: (
          <PerfectText size={14} lines={1} containerWidth={300}>
            {TESTO}
          </PerfectText>
        ),
        rif: 300,
      },
    ];
    for (const { elemento, rif } of casi) {
      const stretto = larghezzaDiOggi(rif) * 0.6;
      expect(
        larghezzaEffettiva(stileDelContenitore(elemento), stretto)
      ).toBeLessThanOrEqual(stretto);
    }
  });

  it("testo multiriga: in una riga con un'icona accanto si restringe", () => {
    const riga = larghezzaDiOggi(AUTOMATICA);
    const ICONA = 24;
    const radice = albero(
      renderWithProviders(
        <View style={{ flexDirection: 'row', width: riga }}>
          <View style={{ width: ICONA, height: ICONA }} />
          <PerfectText size={14} lines={2}>
            {TESTO}
          </PerfectText>
        </View>,
        render
      ).toJSON()
    );
    const figli = (radice?.children ?? []) as Nodo[];
    const testo = figli[1];
    expect(testo?.type).toBe('View');
    const stile = (StyleSheet.flatten(testo?.props.style) ?? {}) as Stile;
    expect(larghezzaInRiga(stile, riga - ICONA)).toBeLessThanOrEqual(
      riga - ICONA
    );
  });

  it('testo multiriga: uguale a prima in un contenitore largo', () => {
    const casi = [
      {
        elemento: (
          <PerfectText size={14} lines={2}>
            {TESTO}
          </PerfectText>
        ),
        rif: AUTOMATICA,
      },
      {
        elemento: (
          <PerfectText size={14} lines={1} containerWidth={300}>
            {TESTO}
          </PerfectText>
        ),
        rif: 300,
      },
    ];
    for (const { elemento, rif } of casi) {
      const prima = larghezzaDiOggi(rif);
      const stile = stileDelContenitore(elemento);
      expect(larghezzaEffettiva(stile, prima * 3)).toBeCloseTo(prima, 5);
      expect(stile.alignSelf).toBe('center');
    }
  });

  it('testo multiriga: containerWidth 0 resta spento a scala 2', () => {
    // Sotto Jest SystemImmunity blocca l'ingrandimento: lo si ricarica come in produzione.
    const worker = process.env.JEST_WORKER_ID;
    delete process.env.JEST_WORKER_ID;
    let tipo: string | undefined;
    try {
      jest.isolateModules(() => {
        const R = require('react') as typeof import('react');
        const RN = require('react-native') as typeof import('react-native');
        jest.spyOn(RN.PixelRatio, 'getFontScale').mockReturnValue(2);
        const { render: monta } =
          require('@testing-library/react-native/pure') as typeof import('@testing-library/react-native/pure');
        const { AllProviders } = require('../../helpers/testProviders');
        const { PerfectText: Testo } =
          require('../../../components/ui/PerfectText') as typeof import('../../../components/ui/PerfectText');
        const ui = monta(
          R.createElement(
            Testo,
            { size: 14, lines: 3, containerWidth: 0 },
            TESTO
          ),
          { wrapper: AllProviders }
        );
        expect(RN.PixelRatio.getFontScale()).toBe(2);
        tipo = albero(ui.toJSON())?.type;
        ui.unmount();
      });
    } finally {
      process.env.JEST_WORKER_ID = worker;
    }
    expect(tipo).toBe('Text');
  });
});
