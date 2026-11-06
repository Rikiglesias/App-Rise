/**
 * F14-ponte (android-play), lotto A: i testi delle finestre e delle tessere di Azioni non si tagliano
 * con «…» e non si spezzano a metà parola, e la X di «Come donare» non copre il titolo.
 * Il taglio si vede solo sul dispositivo (foto F12 della vc25: «feeding those i…», «Continu»,
 * «initiativ…»); qui si fissa la causa: il tetto di righe e la riga sola senza restringimento.
 */
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import i18n from '@/locales';
import ActionButtons from '@/features/actions/components/ActionButtons/ActionButtons';
import DonationInfoModal from '@/features/actions/components/shared/DonationInfoModal';
import PartnerDisclosureModal from '@/features/actions/components/shared/PartnerDisclosureModal';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

/** Solo il tema: queste schermate non leggono l'accesso, e il suo provider aggiorna lo stato dopo il test. */
const monta = (elemento: React.ReactElement) =>
  render(
    <UniversalThemeProvider initialTheme="light" followSystem={false}>
      {elemento}
    </UniversalThemeProvider>
  );

jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({
    openLink: jest.fn(),
    openTracciabilitaLink: jest.fn(),
  }),
}));

jest.mock('@/shared/partner/usePartnerExit', () => ({
  usePartnerExit: () => ({
    isLoading: null,
    disclosureVisible: false,
    openDonation: jest.fn(),
    openLetsDonationExit: jest.fn(),
    confirmDisclosure: jest.fn(),
    cancelDisclosure: jest.fn(),
  }),
}));

jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

const animazioni = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: Array.from({ length: 8 }, () => new Animated.Value(1)),
};

/** Le ultime parole di un testo, come espressione regolare: trovano il paragrafo che lo contiene. */
const finale = (chiave: string): RegExp =>
  new RegExp(
    i18n
      .t(chiave)
      .slice(-18)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

describe('F14-ponte lotto A: testi interi nelle Azioni', () => {
  it('Come donare: nessun paragrafo del corpo ha un tetto di righe (il corpo scorre)', () => {
    monta(<DonationInfoModal visible onClose={jest.fn()} />);
    const tetti = [
      'actions.donationMonetaryText',
      'actions.donationShoppingText',
      'actions.donationGiftCardText',
    ].map(chiave => ({
      chiave,
      righe: screen.getByText(finale(chiave)).props.numberOfLines ?? 0,
    }));
    expect(tetti).toEqual(tetti.map(({ chiave }) => ({ chiave, righe: 0 })));
  });

  it('Come donare: la X sta dentro l’intestazione, quindi il titolo parte sotto di lei', () => {
    monta(<DonationInfoModal visible onClose={jest.fn()} />);
    const x = StyleSheet.flatten(
      screen.getByTestId('donation-modal-close').props.style
    );
    const intestazione = StyleSheet.flatten(
      screen.getByTestId('donation-modal-header').props.style
    );
    // La X è in posizione assoluta: senza altezza propria l'intestazione è alta 0 e il titolo
    // comincia dove la X sporge ancora.
    expect(intestazione.minHeight ?? 0).toBeGreaterThanOrEqual(
      x.top + x.height
    );
  });

  it('Uscita dall’app: «Continua» e «Annulla» restano su una riga e si restringono invece di spezzarsi', () => {
    monta(
      <PartnerDisclosureModal
        visible
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    const etichette = [
      'partner.disclosureContinue',
      'partner.disclosureCancel',
    ].map(chiave => {
      const { numberOfLines, adjustsFontSizeToFit } = screen.getByText(
        i18n.t(chiave)
      ).props;
      return { chiave, numberOfLines, adjustsFontSizeToFit };
    });
    expect(etichette).toEqual(
      etichette.map(({ chiave }) => ({
        chiave,
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
      }))
    );
  });

  it('tessere di Azioni: i sottotitoli possono andare su due righe invece di finire con «…»', () => {
    monta(
      <ActionButtons
        animations={animazioni as never}
        navigation={{} as never}
      />
    );
    const righe = [
      'actions.donateSubtitle',
      'actions.exploreSubtitle',
      'actions.communitySubtitle',
    ].map(chiave => ({
      chiave,
      righe: screen.getByText(i18n.t(chiave)).props.numberOfLines,
    }));
    expect(righe).toEqual(righe.map(({ chiave }) => ({ chiave, righe: 2 })));
  });
});
