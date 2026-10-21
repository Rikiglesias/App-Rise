/**
 * C41 (contratto android-play): le finestre «Stai per uscire dall'app» e «Info donazioni» tengono
 * il corpo in uno ScrollView alto al massimo una quota della finestra, con titolo e pulsanti fuori:
 * col testo grande su un telefono piccolo i pulsanti restano raggiungibili. Montate su 360×640 e
 * 320×568 col ramo Android (vedi `helpers/touchArea`).
 */
import type { ReactElement } from 'react';

import { FINESTRE_C43, suTelefono } from '../helpers/touchArea';
import {
  BODY_SHARE_CLOSE_ONLY,
  BODY_SHARE_WITH_BUTTONS,
  modalBodyMaxHeight,
} from '@/shared/utils/modalBodyMaxHeight';

type Caso = {
  elemento: () => ReactElement;
  /** testID dello ScrollView del corpo. */
  scorrevole: string;
  quota: number;
  /** Chiavi dei testi che devono stare DENTRO lo ScrollView. */
  corpo: string[];
  /** testID dei pulsanti che devono stare FUORI dallo ScrollView. */
  pulsanti: string[];
};

const noop = (): void => undefined;

const verifica = (caso: Caso): void => {
  for (const finestra of FINESTRE_C43) {
    suTelefono(finestra, () => {
      const React = require('react') as typeof import('react');
      const { StyleSheet } = require('react-native');
      const { render, within } = require('@testing-library/react-native/pure');
      const { AllProviders } = require('../helpers/testProviders');
      const i18n = require('@/locales').default;
      i18n.locale = 'it';
      const ui = render(
        React.createElement(AllProviders, null, caso.elemento())
      );
      const scorrevole = ui.getByTestId(caso.scorrevole);
      expect({
        finestra,
        maxHeight: StyleSheet.flatten(scorrevole.props.style)?.maxHeight,
      }).toEqual({
        finestra,
        maxHeight: modalBodyMaxHeight(finestra.height, caso.quota),
      });
      for (const chiave of caso.corpo) {
        expect(within(scorrevole).getByText(i18n.t(chiave))).toBeTruthy();
      }
      for (const id of caso.pulsanti) {
        expect(ui.getByTestId(id)).toBeTruthy();
        expect(within(scorrevole).queryByTestId(id)).toBeNull();
      }
      ui.unmount();
    });
  }
};

describe('C41 finestre scorrevoli', () => {
  it("finestre scorrevoli: uscita dall'app", () => {
    verifica({
      elemento: () => {
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
      scorrevole: 'partner-disclosure-body',
      quota: BODY_SHARE_WITH_BUTTONS,
      corpo: ['partner.donorboxDisclosureBody'],
      pulsanti: [
        'partner-disclosure-cancel',
        'partner-disclosure-confirm',
        'partner-disclosure-without-data',
      ],
    });
  });

  it('finestre scorrevoli: info donazioni', () => {
    verifica({
      elemento: () => {
        const DonationInfoModal =
          require('@/features/actions/components/shared/DonationInfoModal').default;
        return require('react').createElement(DonationInfoModal, {
          visible: true,
          onClose: noop,
        });
      },
      scorrevole: 'donation-modal-body',
      quota: BODY_SHARE_CLOSE_ONLY,
      corpo: ['actions.donationEvents'],
      pulsanti: ['donation-modal-close'],
    });
  });
});
