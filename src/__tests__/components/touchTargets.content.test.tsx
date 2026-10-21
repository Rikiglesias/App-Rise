/**
 * C43 (contratto android-play), seconda parte: contatti, social, StatCard e pulsanti dell'account,
 * misurati su 360×640 e 320×568 dp col ramo Android. L'area misurata è quella dichiarata dal
 * controllo (vedi `helpers/touchArea`).
 */
import {
  atteso48,
  misuraSuTelefoni,
  type Elemento,
  type Interrogazioni,
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
  (ui: Interrogazioni): Elemento[] =>
    ui.getAllByLabelText(label);

describe('C43 aree toccabili — contenuti e account', () => {
  it('aree toccabili: contatti', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const ChiSiamo =
            require('@/features/about/screens/ChiSiamoScreen').default;
          return React().createElement(ChiSiamo, { navigation });
        },
        // Sede, telefono ed email: tutti e tre.
        trova: ui => {
          const contatti = ui.getAllByLabelText(/^Apri (Sede|Telefono|Email)$/);
          expect(contatti).toHaveLength(3);
          return contatti;
        },
      })
    );
  });

  it('aree toccabili: social', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const Seguici =
            require('@/features/social/screens/SeguiciScreen').default;
          return React().createElement(Seguici, { navigation });
        },
        trova: ui => ui.getAllByTestId(/^social-card-/),
      })
    );
  });

  it('aree toccabili: StatCard', () => {
    atteso48(
      misuraSuTelefoni({
        elemento: () => {
          const { StatCard } = require('@/features/impact/components/StatCard');
          return React().createElement(StatCard, {
            icon: 'food',
            iconColor: '#000000',
            value: '1',
            label: 'Pasti',
            subtitle: 'nel 2025',
            gradientColors: ['#000000', '#ffffff'],
            onPress: noop,
            pressable: true,
          });
        },
        trova: ui => ui.getAllByRole('button'),
      })
    );
  });

  it("aree toccabili: pulsanti dell'account", () => {
    const casi: Parameters<typeof misuraSuTelefoni>[0][] = [
      // Ingresso all'account nell'intestazione delle schede (C30).
      {
        elemento: () => {
          const { TabHeader } = require('@/navigation/TabHeader');
          return React().createElement(TabHeader, { options: {} });
        },
        trova: ui => ui.getByTestId('account-header-button'),
      },
      // Le cinque varianti del pulsante di tutte le pagine dell'account.
      ...(
        ['primary', 'secondary', 'link', 'linkMuted', 'linkStrong'] as const
      ).map(variant => ({
        elemento: () => {
          const {
            AuthButton,
          } = require('@/features/auth/components/AuthButton');
          return React().createElement(AuthButton, {
            label: `variante ${variant}`,
            onPress: noop,
            variant,
          });
        },
        trova: (ui: Interrogazioni) => ui.getAllByRole('button'),
      })),
      // Mostra/nascondi della password.
      {
        elemento: () => {
          const { AuthInput } = require('@/features/auth/components/AuthInput');
          return React().createElement(AuthInput, {
            label: 'Password',
            value: '',
            onChangeText: noop,
            secureTextEntry: true,
          });
        },
        trova: conEtichetta('Mostra password'),
      },
      // Campi che aprono una scelta: paese e data.
      {
        elemento: () => {
          const {
            AuthCountryField,
          } = require('@/features/auth/components/AuthCountryField');
          return React().createElement(AuthCountryField, {
            label: 'Paese',
            value: 'IT',
            onSelect: noop,
          });
        },
        trova: ui => ui.getByTestId('country-field'),
      },
      {
        elemento: () => {
          const {
            AuthDateField,
          } = require('@/features/auth/components/AuthDateField');
          return React().createElement(AuthDateField, {
            label: 'Data di nascita',
            value: '',
            onChange: noop,
          });
        },
        trova: conEtichetta('Data di nascita'),
      },
      // Casella del consenso.
      {
        elemento: () => {
          const {
            AuthConsentCheckbox,
          } = require('@/features/auth/components/AuthConsentCheckbox');
          return React().createElement(AuthConsentCheckbox, {
            checked: false,
            onToggle: noop,
            label: 'Accetto',
          });
        },
        trova: ui => ui.getAllByRole('checkbox'),
      },
      // Suggerimenti del comune, che compaiono digitando.
      {
        elemento: () => {
          const {
            AuthCityField,
          } = require('@/features/auth/components/AuthCityField');
          return React().createElement(AuthCityField, {
            label: 'Città',
            value: 'Roma',
            country: 'IT',
            onChangeCity: noop,
            onSelectComune: noop,
          });
        },
        prepara: ui => {
          ui.fireEvent.changeText(
            ui.getAllByLabelText('Città')[0] as Elemento,
            'Roma'
          );
        },
        trova: ui => ui.getAllByTestId(/^city-option-/),
      },
    ];
    for (const caso of casi) atteso48(misuraSuTelefoni(caso));
  });
});
