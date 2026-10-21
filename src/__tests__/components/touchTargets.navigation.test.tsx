/**
 * C43 (contratto android-play), prima parte: area toccabile come funzione pura ≥ 48 dp e i controlli
 * di navigazione (schede, indietro, chiudi), misurati su 360×640 e 320×568 dp col ramo Android.
 * L'area misurata è quella dichiarata dal controllo (vedi `helpers/touchArea`).
 */
import type { ReactNode } from 'react';

import {
  atteso48,
  FINESTRE_C43,
  misuraSuTelefoni,
  type Interrogazioni,
  type Montaggio,
} from '../helpers/touchArea';
import { scaleWithDimensions } from '@/shared/constants/perfectScale';
import {
  MIN_TOUCH_TARGET_DP,
  minimumTouchTarget,
  touchTargetHitSlop,
} from '@/shared/utils/minimumTouchTarget';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: jest.fn(),
    canGoBack: () => true,
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      locations:
        require('@/features/impact/utils/mapHelpers').convertToMapLocations(),
    },
  }),
}));

const noop = (): void => undefined;
const navigation = { goBack: noop, navigate: noop };
const React = (): typeof import('react') => require('react');

const conEtichetta = (label: string) => (ui: Interrogazioni) =>
  ui.getAllByLabelText(label);

describe('C43 aree toccabili — funzione e navigazione', () => {
  it('aree toccabili: minimo 48 dp', () => {
    expect(MIN_TOUCH_TARGET_DP).toBe(48);
    for (const finestra of FINESTRE_C43) {
      // Una misura pensata a 48 sul telefono di riferimento qui scende sotto: la funzione la riporta su.
      const scalata = scaleWithDimensions(48, finestra.width, finestra.height);
      expect(scalata).toBeLessThan(48);
      expect(minimumTouchTarget(scalata)).toEqual({
        minWidth: 48,
        minHeight: 48,
      });
      const slop = touchTargetHitSlop(scalata);
      expect(scalata + slop.left + slop.right).toBeCloseTo(48, 9);
      expect(scalata + slop.top + slop.bottom).toBeCloseTo(48, 9);
    }
    // Più grande resta com'è; misura assente o non numerica vale 48 pieno.
    expect(minimumTouchTarget(64)).toEqual({ minWidth: 64, minHeight: 64 });
    expect(minimumTouchTarget(Number.NaN)).toEqual({
      minWidth: 48,
      minHeight: 48,
    });
    expect(touchTargetHitSlop(60)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    expect(touchTargetHitSlop(Number.NaN, 40)).toEqual({
      top: 4,
      bottom: 4,
      left: 24,
      right: 24,
    });
  });

  it('aree toccabili: schede', () => {
    for (const routeName of ['ImpactTab', 'HomeTab', 'InfoTab']) {
      atteso48(
        misuraSuTelefoni({
          elemento: () => {
            const { TabBarButton } = require('@/navigation/TabBarButton');
            return React().createElement(TabBarButton, {
              isFocused: routeName === 'HomeTab',
              isCentral: routeName === 'HomeTab',
              options: { tabBarAccessibilityLabel: `scheda ${routeName}` },
              onPress: noop,
              onLongPress: noop,
              routeName,
            });
          },
          trova: conEtichetta(`scheda ${routeName}`),
        })
      );
    }
  });

  it('aree toccabili: indietro', () => {
    const pagine: (() => ReactNode)[] = [
      () => {
        const {
          AuthBackButton,
        } = require('@/features/auth/components/AuthBackButton');
        return React().createElement(AuthBackButton);
      },
      () => {
        const {
          ImpactDetailLayout,
        } = require('@/features/impact/components/ImpactDetailLayout');
        return React().createElement(ImpactDetailLayout, {
          title: 'Titolo',
          paragraphs: [],
          stats: [],
        });
      },
      () => {
        const ChiSiamo =
          require('@/features/about/screens/ChiSiamoScreen').default;
        return React().createElement(ChiSiamo, { navigation });
      },
      () => {
        const Seguici =
          require('@/features/social/screens/SeguiciScreen').default;
        return React().createElement(Seguici, { navigation });
      },
    ];
    for (const elemento of pagine) {
      atteso48(misuraSuTelefoni({ elemento, trova: conEtichetta('Indietro') }));
    }
  });

  it('aree toccabili: chiudi', () => {
    const casi: Montaggio[] = [
      {
        elemento: () => {
          const {
            StoriaModal,
          } = require('@/features/about/components/StoriaModal');
          return React().createElement(StoriaModal, {
            visible: true,
            onClose: noop,
          });
        },
        trova: ui => ui.getByTestId('storia-modal-close'),
      },
      {
        elemento: () => {
          const DonationInfoModal =
            require('@/features/actions/components/shared/DonationInfoModal').default;
          return React().createElement(DonationInfoModal, {
            visible: true,
            onClose: noop,
          });
        },
        trova: ui => ui.getByTestId('donation-modal-close'),
      },
      {
        elemento: () => {
          const MapLocationModal =
            require('@/components/layout/MapLocationModal').default;
          const {
            getModalData,
          } = require('@/features/impact/data/mapModalData');
          const {
            LOCATIONS_DATA,
          } = require('@/features/impact/data/locationsData');
          return React().createElement(MapLocationModal, {
            visible: true,
            onClose: noop,
            data: getModalData(LOCATIONS_DATA[0].id),
          });
        },
        trova: conEtichetta('Chiudi'),
      },
      {
        elemento: () => {
          const MapModalScreen =
            require('@/features/impact/screens/MapModalScreen').default;
          const {
            BottomTabBarHeightContext,
          } = require('@react-navigation/bottom-tabs');
          return React().createElement(
            BottomTabBarHeightContext.Provider,
            { value: 0 },
            React().createElement(MapModalScreen)
          );
        },
        trova: conEtichetta('Chiudi la mappa'),
      },
    ];
    for (const caso of casi) atteso48(misuraSuTelefoni(caso));
  });
});
