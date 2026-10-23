/**
 * Le etichette della barra in basso restano leggibili sul fondo che hanno davvero sotto.
 * Fondi misurati sull'emulatore Pixel_8 (23/10, schermate della build di sviluppo): la barra è
 * `#FAFAFA`, ma «Home» sta nell'ombra grigia del pulsante centrale (`#EAEAEA`), dove il grigio
 * `neutral[500]` arrivava a 4,0:1. Solo tema chiaro: l'app è forzata in chiaro
 * (`app.config.js` `userInterfaceStyle: 'light'` + `expo-system-ui`).
 */
import React from 'react';
import { render } from '@testing-library/react-native';

import { coloreDi, contrasto } from '@/__tests__/helpers/contrasto';
import { TabBarButton } from '@/navigation/TabBarButton';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

const AA = 4.5;
const FONDO_BARRA = '#FAFAFA';
const OMBRA_PULSANTE_CENTRALE = '#EAEAEA';

const etichetta = (routeName: string, testo: string, isFocused: boolean) =>
  coloreDi(
    render(
      <UniversalThemeProvider initialTheme="light" followSystem={false}>
        <TabBarButton
          isFocused={isFocused}
          isCentral={routeName === 'HomeTab'}
          options={{ tabBarAccessibilityLabel: testo }}
          onPress={() => undefined}
          onLongPress={() => undefined}
          routeName={routeName}
        />
      </UniversalThemeProvider>
    ).getByText(testo)
  );

describe('etichette della barra in basso', () => {
  it.each([true, false])(
    'contrasto: «Home» sull’ombra del pulsante centrale (attiva: %s)',
    isFocused => {
      expect(
        contrasto(
          etichetta('HomeTab', 'Home', isFocused),
          OMBRA_PULSANTE_CENTRALE
        )
      ).toBeGreaterThanOrEqual(AA);
    }
  );

  it.each([
    ['ImpactTab', 'Impatto'],
    ['InfoTab', 'Azioni'],
  ])('contrasto: etichetta di %s sulla barra', (routeName, testo) => {
    expect(
      contrasto(etichetta(routeName, testo, false), FONDO_BARRA)
    ).toBeGreaterThanOrEqual(AA);
  });
});
