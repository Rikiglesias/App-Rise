/**
 * C57 (contratto android-play): scheda del paese della mappa d'impatto.
 * - L'anno sta in un badge velato sopra il gradiente rosso: il velo si compone su ENTRAMBI gli estremi
 *   del gradiente e conta il contrasto più basso. Col velo bianco `glass.medium` (0,2) nessun colore di
 *   testo arriva a 4,5:1 sull'estremo scuro (il nero si ferma a 4,49), per questo il fondo si legge dal
 *   badge reso e non si dà per scontato.
 * - «Segui il tracciamento» ha l'area toccabile della funzione pura di C43, misurata col ramo Android.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { coloreDi, contrasto } from '../helpers/contrasto';
import { AllProviders } from '../helpers/testProviders';
import { atteso48, misuraSuTelefoni } from '../helpers/touchArea';
import MapLocationModal from '@/components/layout/MapLocationModal';
import { LOCATIONS_DATA } from '@/features/impact/data/locationsData';
import {
  getModalData,
  type MapModalData,
} from '@/features/impact/data/mapModalData';

const AA = 4.5;
const noop = (): void => undefined;

// Nei dati veri il tracciamento non c'è ancora: senza, il pulsante non si vede.
const datiConTracciamento = (): MapModalData => {
  const id = LOCATIONS_DATA[0]?.id ?? '';
  const dati = getModalData(id, 'it');
  if (!dati) throw new Error(`località senza dati: ${id}`);
  return { ...dati, trackingUrl: 'https://riseagainsthunger.org' };
};

type Nodo = {
  props: Record<string, unknown>;
  parent: Nodo | null;
};

const antenato = (nodo: Nodo, cerca: (n: Nodo) => boolean): Nodo => {
  for (let n = nodo.parent; n; n = n.parent) if (cerca(n)) return n;
  throw new Error('antenato non trovato');
};

const fondoDi = (n: Nodo): string | undefined => {
  const colore = StyleSheet.flatten(
    n.props.style as StyleProp<ViewStyle>
  )?.backgroundColor;
  return typeof colore === 'string' ? colore : undefined;
};

const rgba = (colore: string): [number, number, number, number] => {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colore);
  if (hex)
    return [
      parseInt(hex[1] ?? '', 16),
      parseInt(hex[2] ?? '', 16),
      parseInt(hex[3] ?? '', 16),
      1,
    ];
  const fn =
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      colore
    );
  if (fn)
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), Number(fn[4] ?? 1)];
  throw new Error(`colore non misurabile: ${colore}`);
};

/** Il velo composto sopra un fondo pieno, come lo vede chi legge. */
const componi = (velo: string, sotto: string): string => {
  const [vr, vg, vb, va] = rgba(velo);
  const [sr, sg, sb] = rgba(sotto);
  const c = (v: number, s: number) => Math.round(v * va + s * (1 - va));
  return `rgb(${c(vr, sr)}, ${c(vg, sg)}, ${c(vb, sb)})`;
};

describe('scheda del paese (C57)', () => {
  it('contrasto: anno nella scheda del paese', () => {
    const dati = datiConTracciamento();
    const ui = render(
      <AllProviders>
        <MapLocationModal visible data={dati} onClose={noop} />
      </AllProviders>
    );
    const anno = ui.getByText(String(dati.year)) as unknown as Nodo;
    const badge = antenato(anno, n => fondoDi(n) !== undefined);
    const gradiente = antenato(badge, n => Array.isArray(n.props.colors));
    const estremi = gradiente.props.colors as string[];
    const velo = fondoDi(badge) ?? '';
    const testo = coloreDi(anno as Parameters<typeof coloreDi>[0]);

    expect(estremi.length).toBeGreaterThanOrEqual(2);
    const peggiore = Math.min(
      ...estremi.map(e => contrasto(testo, componi(velo, e)))
    );
    expect(peggiore).toBeGreaterThanOrEqual(AA);
  });

  it('scheda del paese: Segui il tracciamento ≥ 48 dp', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const R = require('react') as typeof import('react');
          const Scheda =
            require('@/components/layout/MapLocationModal').default;
          return R.createElement(Scheda, {
            visible: true,
            onClose: noop,
            data: datiConTracciamento(),
          });
        },
        trova: ui => ui.getAllByRole('link'),
      })
    );
  });
});
