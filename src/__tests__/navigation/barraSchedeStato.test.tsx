/**
 * F14-ponte (android-play), lotto C: la barra delle schede è piena su Android e dice dove sei.
 * Foto della vc25: dietro «Impact» e «Home» si leggevano le voci della lista (il ripiego di expo-blur
 * su Android è un velo semitrasparente, doc Expo SDK 54), e Impact e Actions erano identiche da
 * attive e da non attive. Solo tema chiaro: l'app è forzata in chiaro (`app.config.js`).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { contrasto } from '@/__tests__/helpers/contrasto';
import { suTelefono } from '@/__tests__/helpers/touchArea';
import { PerfectIcon } from '@/components/ui';
import { TabBarButton } from '@/navigation/TabBarButton';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

/** WCAG 1.4.11: le icone che dicono qualcosa, 3:1 sul fondo su cui stanno. */
const NON_TESTO = 3;

const scheda = (routeName: string, isFocused: boolean) => {
  const ui = render(
    <UniversalThemeProvider initialTheme="light" followSystem={false}>
      <TabBarButton
        isFocused={isFocused}
        isCentral={routeName === 'HomeTab'}
        options={{ tabBarAccessibilityLabel: routeName }}
        onPress={() => undefined}
        onLongPress={() => undefined}
        routeName={routeName}
      />
    </UniversalThemeProvider>
  );
  const cerchio = String(
    StyleSheet.flatten(ui.getByTestId(`tab-icon-${routeName}`).props.style)
      .backgroundColor
  );
  const icona = String(ui.UNSAFE_getByType(PerfectIcon).props.color);
  ui.unmount();
  return { cerchio, icona };
};

const SCHEDE = ['ImpactTab', 'HomeTab', 'InfoTab'];

describe('F14-ponte lotto C: barra delle schede', () => {
  it.each(SCHEDE)('%s: da attiva il cerchio cambia', routeName => {
    expect(scheda(routeName, true).cerchio).not.toBe(
      scheda(routeName, false).cerchio
    );
  });

  it.each(SCHEDE)(
    '%s non attiva: l’icona si vede sul suo cerchio (3:1)',
    routeName => {
      const { cerchio, icona } = scheda(routeName, false);
      expect(contrasto(icona, cerchio)).toBeGreaterThanOrEqual(NON_TESTO);
    }
  );

  it('Android: il fondo della barra è pieno e non passa da expo-blur', () => {
    const esito = suTelefono({ width: 412, height: 915 }, () => {
      const React = require('react') as typeof import('react');
      const { render: monta } = require('@testing-library/react-native/pure');
      const { StyleSheet: SS } = require('react-native');
      const { TabBar } = require('@/navigation/TabBar');
      const { AllProviders } = require('@/__tests__/helpers/testProviders');
      const rotte = ['ImpactTab', 'HomeTab', 'InfoTab'].map(name => ({
        key: name,
        name,
      }));
      const ui = monta(
        React.createElement(
          AllProviders,
          null,
          React.createElement(TabBar, {
            state: { index: 1, routes: rotte },
            descriptors: Object.fromEntries(
              rotte.map(r => [
                r.key,
                { options: { tabBarAccessibilityLabel: r.name } },
              ])
            ),
            navigation: { emit: () => ({}), navigate: () => undefined },
          })
        )
      );
      const sfocature = ui.UNSAFE_root.findAll(
        (n: { props: Record<string, unknown> }) =>
          n.props.intensity !== undefined
      ).length;
      const fondo = String(
        SS.flatten(ui.getByTestId('tab-bar-fondo').props.style).backgroundColor
      );
      ui.unmount();
      return { sfocature, fondo };
    });
    expect(esito.sfocature).toBe(0);
    // Pieno: un colore senza trasparenza (contrasto() rifiuta un fondo trasparente).
    expect(() => contrasto('#000000', esito.fondo)).not.toThrow();
  });
});
