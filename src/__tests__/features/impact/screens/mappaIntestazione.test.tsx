/**
 * C56 (contratto android-play): intestazione della mappa interattiva.
 * - Titolo e sottotitolo stanno in una colonna, senza `lines={1}`: vanno a capo invece di tagliarsi e
 *   restano dentro la pillola.
 * - La chiusura sta fuori dalla colonna dei testi, con l'area di C43 (≥ 48 dp).
 * - Il filtro degli anni sta nello stesso contenitore dell'intestazione, sotto di lei, senza un `top`
 *   calcolato a mano (prima `scaleSpacing(56)`: con il titolo su due righe i chip finivano sopra).
 * - Il sottotitolo dice di toccare i paesi: la mappa non ha pin.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AllProviders } from '../../../helpers/testProviders';
import {
  atteso48,
  misuraSuTelefoni,
  type Elemento,
} from '../../../helpers/touchArea';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const {
    convertToMapLocations,
  } = require('@/features/impact/utils/mapHelpers');
  return {
    ...actual,
    useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
    useRoute: () => ({ params: { locations: convertToMapLocations() } }),
  };
});

// Nei dati di oggi tutte le località sono del 2025 e il filtro non compare: una passa al 2024.
jest.mock('@/features/impact/data/locationsData', () => {
  const actual = jest.requireActual('@/features/impact/data/locationsData');
  return {
    ...actual,
    LOCATIONS_DATA: actual.LOCATIONS_DATA.map(
      (l: { anno: number }, i: number) => (i === 0 ? { ...l, anno: 2024 } : l)
    ),
  };
});

const monta = () => {
  const ui = render(
    <AllProviders>
      <MapModalScreen />
    </AllProviders>
  );
  fireEvent(ui.getByTestId('world-map-svg'), 'layout', {
    nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
  });
  return ui;
};

/** Antenati ospite (View, Text…) di un elemento, dal più vicino alla radice. */
const antenati = (el: Elemento): Elemento[] => {
  const out: Elemento[] = [];
  for (let n = el.parent; n; n = n.parent)
    if (typeof n.type === 'string') out.push(n as Elemento);
  return out;
};

/** Il contenitore ospite più vicino che racchiude entrambi. */
const comune = (a: Elemento, b: Elemento): Elemento | undefined => {
  const diB = new Set(antenati(b));
  return antenati(a).find(n => diB.has(n));
};

const stile = (el: Elemento | undefined) =>
  StyleSheet.flatten(el?.props.style) ?? {};

const testi = (ui: ReturnType<typeof monta>) => ({
  titolo: ui.getByText('Mappa Interattiva'),
  sottotitolo: ui.getByText(/^Tocca /),
});

describe('MapModalScreen — intestazione (C56)', () => {
  const originalLocale = getCurrentLocale();
  beforeEach(() => changeLanguage('it'));
  afterEach(() => {
    changeLanguage(originalLocale);
    jest.restoreAllMocks();
  });

  it('mappa: intestazione in colonna', () => {
    const { titolo, sottotitolo } = testi(monta());
    expect(titolo.props.numberOfLines).not.toBe(1);
    expect(sottotitolo.props.numberOfLines).not.toBe(1);
    const colonna = comune(titolo, sottotitolo);
    expect(colonna).toBeDefined();
    expect(stile(colonna).flexDirection ?? 'column').toBe('column');
  });

  it('mappa: chiusura fuori dai testi e ≥ 48 dp', () => {
    const ui = monta();
    const { titolo, sottotitolo } = testi(ui);
    const colonna = comune(titolo, sottotitolo) as Elemento;
    const chiudi = ui.getByLabelText('Chiudi la mappa');
    expect(antenati(chiudi)).not.toContain(colonna);
    ui.unmount();

    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const R = require('react') as typeof import('react');
          const Mappa =
            require('@/features/impact/screens/MapModalScreen').default;
          return R.createElement(Mappa);
        },
        trova: u => u.getAllByLabelText('Chiudi la mappa'),
      })
    );
  });

  it("mappa: filtro sotto l'intestazione nello stesso contenitore", () => {
    const ui = monta();
    const { titolo } = testi(ui);
    const chip = ui.getByLabelText('Tutti');
    const contenitore = comune(titolo, chip);
    // Prima il filtro era un fratello assoluto: l'unico contenitore comune era lo schermo intero.
    expect(contenitore).not.toBe(ui.getByTestId('map-safe-content'));
    expect(stile(contenitore).flexDirection ?? 'column').toBe('column');
    const filtro = antenati(chip)[0];
    expect(stile(filtro).top).toBeUndefined();
    expect(stile(filtro).position).not.toBe('absolute');
  });

  it('mappa: sottotitolo senza pin in it e en', () => {
    const it = monta();
    expect(it.queryByText(/\bpin\b/i)).toBeNull();
    expect(it.getByText(/^Tocca .*paes/i)).toBeTruthy();
    it.unmount();

    changeLanguage('en');
    const en = monta();
    expect(en.queryByText(/\bpins?\b/i)).toBeNull();
    expect(en.getByText(/^Tap .*countr/i)).toBeTruthy();
  });
});
