/**
 * Gemelli di C43 trovati nel giro visivo del 21/10 a 320×568: controlli fuori dai sette del
 * contratto ma della stessa classe (area toccabile sotto 48 dp). Stesso banco delle due parti di
 * C43 (vedi `helpers/touchArea`); file a parte perché quelle hanno lo sha registrato nella
 * controprova.
 */
import type { ReactElement } from 'react';

import {
  atteso48,
  misuraSuTelefoni,
  type Interrogazioni,
  type Montaggio,
} from '../helpers/touchArea';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: jest.fn(),
    canGoBack: () => true,
    navigate: jest.fn(),
  }),
}));

const noop = (): void => undefined;
const navigation = { goBack: noop, navigate: noop };
const React = (): typeof import('react') => require('react');

const conEtichetta =
  (label: string | RegExp) =>
  (ui: Interrogazioni): ReturnType<Interrogazioni['getAllByLabelText']> =>
    ui.getAllByLabelText(label);

describe('C43 aree toccabili — gemelli fuori dai sette controlli', () => {
  it('aree toccabili: pulsanti informazioni', () => {
    const casi: Montaggio[] = [
      // La «i» accanto a Contribuisci (scheda Azioni).
      {
        elemento: () => {
          const {
            DonateButtonsSection,
          } = require('@/features/actions/components/shared/ActionButtonSections');
          const {
            createActionButtonStyles,
          } = require('@/features/actions/components/shared/ActionButtonStyles');
          const { useThemeColors } = require('@/shared/hooks/useThemeColors');
          const Sezione = (): ReactElement =>
            React().createElement(DonateButtonsSection, {
              styles: createActionButtonStyles(useThemeColors()),
              animations: { buttonAnimations: [] },
              donateButtons: [],
              onButtonPress: noop,
              onInfoPress: noop,
            });
          return React().createElement(Sezione);
        },
        trova: ui => ui.getByTestId('donate-info-button'),
      },
      // La «i» della pagina Chi siamo.
      {
        elemento: () => {
          const ChiSiamo =
            require('@/features/about/screens/ChiSiamoScreen').default;
          return React().createElement(ChiSiamo, { navigation });
        },
        trova: conEtichetta('Apri informazioni su Chi Siamo'),
      },
    ];
    for (const caso of casi) atteso48(misuraSuTelefoni(caso));
  });

  it('aree toccabili: paesi della mappa', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const WorldMapSvg =
            require('@/components/layout/WorldMapSvg').default;
          const {
            convertToMapLocations,
          } = require('@/features/impact/utils/mapHelpers');
          return React().createElement(WorldMapSvg, {
            locations: convertToMapLocations(),
            onMarkerPress: noop,
            isFullScreen: true,
          });
        },
        // Senza misura del riquadro la mappa non disegna i paesi: restano solo i chip.
        trova: conEtichetta(/: tocca per i dettagli$/),
      })
    );
  });

  it('aree toccabili: campi di testo', () => {
    const casi: Montaggio[] = [
      {
        elemento: () => {
          const { AuthInput } = require('@/features/auth/components/AuthInput');
          return React().createElement(AuthInput, {
            label: 'Email',
            value: '',
            onChangeText: noop,
          });
        },
        trova: conEtichetta('Email'),
      },
      {
        elemento: () => {
          const {
            AuthCityField,
          } = require('@/features/auth/components/AuthCityField');
          return React().createElement(AuthCityField, {
            label: 'Città',
            value: '',
            country: 'IT',
            onChangeCity: noop,
            onSelectComune: noop,
          });
        },
        trova: conEtichetta('Città'),
      },
      // Numero e prefisso del telefono: stili passati alla libreria.
      {
        elemento: () => {
          const {
            AuthPhoneField,
          } = require('@/features/auth/components/AuthPhoneField');
          return React().createElement(AuthPhoneField, {
            label: 'Telefono',
            onChangeText: noop,
          });
        },
        trova: ui => [
          ...ui.getAllByLabelText('Telefono'),
          ...ui.getAllByLabelText('Scegli il prefisso internazionale'),
        ],
      },
    ];
    for (const caso of casi) atteso48(misuraSuTelefoni(caso));
  });

  it('aree toccabili: finestra dei partner', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const PartnerDisclosureModal =
            require('@/features/actions/components/shared/PartnerDisclosureModal').default;
          return React().createElement(PartnerDisclosureModal, {
            visible: true,
            onConfirm: noop,
            onCancel: noop,
            onConfirmWithoutData: noop,
          });
        },
        trova: ui => [
          ui.getByTestId('partner-disclosure-cancel'),
          ui.getByTestId('partner-disclosure-confirm'),
          ui.getByTestId('partner-disclosure-without-data'),
        ],
      })
    );
  });
});
