/**
 * C74 (contratto android-play): le due finestre che usano `BODY_SHARE_*` («Stai per uscire dall'app» e
 * «Info donazioni») stanno dentro lo schermo anche in orizzontale. Finestra 600×300 con inset 24 sopra
 * e 24 sotto: la scheda è alta al massimo 300 − 48 = 252 dp meno i margini, e il corpo scorrevole ha
 * `flexShrink: 1`, così cede lui e non i pulsanti. Montate col ramo Android (vedi `helpers/touchArea`).
 */
import type { ReactElement } from 'react';

import { suTelefono } from '../helpers/touchArea';

const FINESTRA = { width: 600, height: 300 };
const INSET = { top: 24, bottom: 24, left: 0, right: 0 };
const TETTO = FINESTRA.height - INSET.top - INSET.bottom;

const noop = (): void => undefined;

type Misura = { maxHeight: unknown; flexShrink: unknown };

const misura = (
  elemento: () => ReactElement,
  scheda: string,
  corpo: string
): Misura =>
  suTelefono(FINESTRA, () => {
    const React = require('react') as typeof import('react');
    const { StyleSheet } = require('react-native');
    const { render } = require('@testing-library/react-native/pure');
    const { AllProviders } = require('../helpers/testProviders');
    require('@/locales').default.locale = 'it';
    jest
      .spyOn(
        jest.requireMock<typeof import('react-native-safe-area-context')>(
          'react-native-safe-area-context'
        ),
        'useSafeAreaInsets'
      )
      .mockReturnValue(INSET);
    const ui = render(React.createElement(AllProviders, null, elemento()));
    const stile = (id: string) =>
      StyleSheet.flatten(ui.getByTestId(id).props.style) ?? {};
    const esito = {
      maxHeight: stile(scheda).maxHeight,
      flexShrink: stile(corpo).flexShrink,
    };
    ui.unmount();
    return esito;
  });

const attesoEntro = ({ maxHeight, flexShrink }: Misura): void => {
  expect({
    maxHeight,
    entroLaFinestra: typeof maxHeight === 'number' && maxHeight <= TETTO,
    flexShrink,
  }).toEqual({ maxHeight, entroLaFinestra: true, flexShrink: 1 });
};

describe('C74 schede entro la finestra', () => {
  it('modale partner: scheda entro la finestra a 600×300', () => {
    attesoEntro(
      misura(
        () => {
          const PartnerDisclosureModal =
            require('@/features/actions/components/shared/PartnerDisclosureModal').default;
          return require('react').createElement(PartnerDisclosureModal, {
            visible: true,
            onConfirm: noop,
            onCancel: noop,
            variant: 'donorbox',
            onConfirmWithoutData: noop,
          });
        },
        'partner-disclosure-content',
        'partner-disclosure-body'
      )
    );
  });

  it('info donazioni: scheda entro la finestra a 600×300', () => {
    attesoEntro(
      misura(
        () => {
          const DonationInfoModal =
            require('@/features/actions/components/shared/DonationInfoModal').default;
          return require('react').createElement(DonationInfoModal, {
            visible: true,
            onClose: noop,
          });
        },
        'donation-modal-content',
        'donation-modal-body'
      )
    );
  });
});
