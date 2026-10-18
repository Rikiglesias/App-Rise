/**
 * Layout comune delle pagine di dettaglio di Impatto, sul vivo dell'anteprima del 18/10:
 * la barra delle schede è flottante e copriva l'ultima card a fine scorrimento; la card
 * delle vite dalla nascita non diceva che contava i soli pasti.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import { IMPACT_DATA } from '@/features/impact/data/impactData';
import BeneficiariesScreen from '@/features/impact/screens/BeneficiariesScreen';
import { changeLanguage } from '@/locales';
import { PerfectSpacing } from '@/shared/constants';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const montaVite = (altezzaBarra?: number) => {
  changeLanguage('it');
  const pagina = (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AllProviders>
        <NavigationContainer>
          <BeneficiariesScreen />
        </NavigationContainer>
      </AllProviders>
    </SafeAreaProvider>
  );
  return render(
    altezzaBarra === undefined ? (
      pagina
    ) : (
      <BottomTabBarHeightContext.Provider value={altezzaBarra}>
        {pagina}
      </BottomTabBarHeightContext.Provider>
    )
  );
};

const spazioInFondo = () =>
  StyleSheet.flatten(
    screen.getByTestId('impact-detail-scroll').props.contentContainerStyle
  ).paddingBottom;

describe('ImpactDetailLayout', () => {
  it('il fondo della pagina resta fuori dalla barra delle schede', () => {
    montaVite(120);
    expect(spazioInFondo()).toBe(120 + PerfectSpacing.xl);
  });

  it('fuori dal navigatore a schede il fondo ha solo il margine', () => {
    montaVite();
    expect(spazioInFondo()).toBe(PerfectSpacing.xl);
  });

  it('le vite dalla nascita dicono che contano i pasti', () => {
    montaVite();
    const formatta = new Intl.NumberFormat('it').format(
      IMPACT_DATA.livesImpactedLifetime
    );
    expect(screen.getByText(formatta)).toBeTruthy();
    expect(
      screen.getByText(
        'Con i pasti, dalla nascita di Rise Against Hunger Italia'
      )
    ).toBeTruthy();
  });
});
