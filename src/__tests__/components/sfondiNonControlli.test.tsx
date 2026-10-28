/**
 * C94 (contratto android-play): lo sfondo toccabile che chiude Storia, Come Donare e l'avviso partner
 * non è un elemento per lo screen reader: `accessible={false}` e `focusable={false}` arrivano davvero
 * all'elemento nativo, anche sul ramo Android, dove `PlatformTouchable` passa un elenco chiuso di prop.
 * Lo stesso vale per il toccabile interno che avvolge la scheda. Il contenuto resta raggiungibile.
 * Lo sfondo è il primo `PlatformTouchable` della finestra, il toccabile interno il secondo.
 */
import type { ReactElement } from 'react';

import { suTelefono } from '../helpers/touchArea';

const FINESTRA = { width: 360, height: 640 };
const noop = (): void => undefined;

type Caso = {
  elemento: () => ReactElement;
  /** Quanti toccabili spenti: lo sfondo e, se avvolge la scheda, quello interno. */
  spenti: number;
  /** Etichetta di un pulsante del contenuto, da trovare per ruolo. */
  pulsante: string;
};

const verifica = (caso: Caso): void =>
  suTelefono(FINESTRA, () => {
    const React = require('react') as typeof import('react');
    const { render } =
      require('@testing-library/react-native/pure') as typeof import('@testing-library/react-native/pure');
    const { AllProviders } = require('../helpers/testProviders');
    const PlatformTouchable = require('@/components/ui/PlatformTouchable')
      .default as typeof import('@/components/ui/PlatformTouchable').default;
    const i18n = require('@/locales').default;
    i18n.locale = 'it';
    const ui = render(React.createElement(AllProviders, null, caso.elemento()));
    try {
      const toccabili = ui.UNSAFE_getAllByType(PlatformTouchable);
      const nativi = toccabili.slice(0, caso.spenti).map(t => {
        const host = t.findAll(
          (n: { type: unknown }) => typeof n.type === 'string'
        )[0];
        return {
          accessible: host?.props.accessible,
          focusable: host?.props.focusable,
        };
      });
      expect(nativi).toEqual(
        Array.from({ length: caso.spenti }, () => ({
          accessible: false,
          focusable: false,
        }))
      );
      expect(
        ui.getByRole('button', { name: i18n.t(caso.pulsante) })
      ).toBeTruthy();
    } finally {
      ui.unmount();
    }
  });

describe('C94 sfondi che chiudono', () => {
  it('sfondo non è un controllo senza nome: Storia', () => {
    verifica({
      elemento: () => {
        const StoriaModal =
          require('@/features/about/components/StoriaModal').default;
        return require('react').createElement(StoriaModal, {
          visible: true,
          onClose: noop,
        });
      },
      spenti: 1,
      pulsante: 'accessibility.closeModal',
    });
  });

  it('sfondo non è un controllo senza nome: Come Donare', () => {
    verifica({
      elemento: () => {
        const DonationInfoModal =
          require('@/features/actions/components/shared/DonationInfoModal').default;
        return require('react').createElement(DonationInfoModal, {
          visible: true,
          onClose: noop,
        });
      },
      spenti: 2,
      pulsante: 'accessibility.closeDonationInfo',
    });
  });

  it('sfondo non è un controllo senza nome: avviso partner', () => {
    verifica({
      elemento: () => {
        const PartnerDisclosureModal =
          require('@/features/actions/components/shared/PartnerDisclosureModal').default;
        return require('react').createElement(PartnerDisclosureModal, {
          visible: true,
          onConfirm: noop,
          onCancel: noop,
          variant: 'letsdonation',
        });
      },
      spenti: 2,
      pulsante: 'partner.disclosureCancel',
    });
  });
});
