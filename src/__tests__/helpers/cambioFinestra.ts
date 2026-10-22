/**
 * C54 (contratto android-play): la finestra cambia con l'app aperta. Con target 36, Android 16 ignora il
 * blocco in verticale sugli schermi ≥ 600 dp: un pieghevole che si apre e poi si gira passa per le
 * finestre di `FINESTRE_C54` senza riavviare l'attività. `Dimensions.set` è la strada del nativo
 * (`didUpdateDimensions`) ed emette `change` come sul telefono.
 *
 * Oracolo: dopo ogni cambio l'albero già montato è identico a un montaggio nuovo sulla stessa finestra,
 * cioè a come sarebbe dopo un riavvio a moduli già caricati. Gli stili calcolati all'import restano
 * fuori: `scale()` guarda il lato corto e la diagonale, che girando non cambiano, e la prova vera resta
 * la rotazione del tablet in C47. Il primo cambio deve cambiare qualcosa, sennò il confronto passa a vuoto.
 */
import type { ReactElement } from 'react';
import { Dimensions } from 'react-native';
import { act, render, type RenderResult } from '@testing-library/react-native';

import type { WindowSize } from '@/shared/utils/textScale';

export const FINESTRE_C54 = [
  { width: 411, height: 923 }, // pieghevole chiuso: un telefono, in verticale
  { width: 820, height: 791 }, // aperto: lato corto ≥ 600, il blocco in verticale non vale più
  { width: 791, height: 820 }, // aperto e girato
] as const satisfies readonly WindowSize[];

const iniziale = {
  window: Dimensions.get('window'),
  screen: Dimensions.get('screen'),
};

export const impostaFinestra = (finestra: WindowSize): void => {
  const window = { ...finestra, scale: 2, fontScale: 1 };
  act(() => Dimensions.set({ window, screen: window }));
};

/** Da chiamare in `afterEach`: la finestra è di tutto il file di test. */
export const ripristinaFinestra = (): void => {
  act(() => Dimensions.set(iniziale));
};

type Nodo = { props?: { testID?: unknown }; children?: unknown[] | null };

const cerca = (nodo: unknown, testID: string): Nodo | undefined => {
  if (Array.isArray(nodo)) {
    for (const n of nodo) {
      const trovato = cerca(n, testID);
      if (trovato) return trovato;
    }
    return undefined;
  }
  if (!nodo || typeof nodo !== 'object') return undefined;
  const n = nodo as Nodo;
  if (n.props?.testID === testID) return n;
  return cerca(n.children ?? [], testID);
};

/** L'albero in JSON senza funzioni (cambiano a ogni montaggio), dal nodo col `testID` se dato. */
const albero = (ui: RenderResult, testID?: string): unknown => {
  const tutto = ui.toJSON();
  const parte = testID ? cerca(tutto, testID) : tutto;
  expect({ testID, trovato: parte !== undefined && parte !== null }).toEqual({
    testID,
    trovato: true,
  });
  return JSON.parse(JSON.stringify(parte));
};

export type MontaggioC54 = {
  /** L'app o il componente, costruito da capo a ogni montaggio. */
  elemento: () => ReactElement;
  /** Dopo il montaggio: porta alla pagina giusta e lascia finire i passaggi. */
  apri?: () => void;
  /** Dopo un cambio di finestra, prima di leggere l'albero. */
  assesta?: () => void;
  /** Il componente da confrontare dentro l'albero; senza, tutto l'albero. */
  testID?: string;
};

export const provaCambioFinestra = ({
  elemento,
  apri,
  assesta,
  testID,
}: MontaggioC54): void => {
  const monta = (): RenderResult => {
    const ui = render(elemento());
    apri?.();
    return ui;
  };
  impostaFinestra(FINESTRE_C54[0]);
  const ui = monta();
  const prima = albero(ui, testID);
  FINESTRE_C54.slice(1).forEach((finestra, passo) => {
    impostaFinestra(finestra);
    assesta?.();
    const dopo = albero(ui, testID);
    const nuovo = monta();
    const atteso = albero(nuovo, testID);
    nuovo.unmount();
    expect({ finestra, albero: dopo }).toEqual({ finestra, albero: atteso });
    if (passo === 0) expect(dopo).not.toEqual(prima);
  });
};
