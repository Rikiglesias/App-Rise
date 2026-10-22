// C49 (contratto android-play): i numeri seguono la lingua dell'app con un formatter unico,
// anche nella scheda della mappa, e il risultato non dipende dall'Intl del motore (Hermes, web, Node).
// I valori attesi sono scritti a mano: il test non usa il formatter per calcolarli.
import React from 'react';
import { render } from '@testing-library/react-native';

import MapLocationModal from '@/components/layout/MapLocationModal';
import { getModalData } from '@/features/impact/data/mapModalData';
import { changeLanguage, getCurrentLocale } from '@/locales';
import { formatNumber } from '@/shared/utils/numberFormat';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

const scheda = (id: string, lingua: 'it' | 'en') => {
  changeLanguage(lingua);
  return render(
    <UniversalThemeProvider initialTheme="light" followSystem={false}>
      <MapLocationModal
        visible
        onClose={() => undefined}
        data={getModalData(id, lingua)}
      />
    </UniversalThemeProvider>
  );
};

describe('numeri nella lingua', () => {
  const originalLocale = getCurrentLocale();
  afterEach(() => changeLanguage(originalLocale));

  it('numeri nella lingua: it', () => {
    expect(formatNumber(5833, 'it')).toBe('5.833');
    expect(formatNumber(10427, 'it')).toBe('10.427');
    expect(formatNumber(1775088, 'it')).toBe('1.775.088');
    expect(formatNumber(3.14, 'it')).toBe('3,14');
    expect(formatNumber(-1200, 'it')).toBe('-1.200');
    expect(scheda('zimbabwe', 'it').getByText('1.775.088')).toBeTruthy();
    expect(scheda('italy', 'it').getByText('5.833')).toBeTruthy();
    const ucraina = scheda('ukraine', 'it');
    expect(ucraina.getByText('52.272')).toBeTruthy();
    expect(ucraina.getByText('4.100')).toBeTruthy();
  });

  it('numeri nella lingua: en', () => {
    expect(formatNumber(5833, 'en')).toBe('5,833');
    expect(formatNumber(10427, 'en')).toBe('10,427');
    expect(formatNumber(1775088, 'en')).toBe('1,775,088');
    expect(formatNumber(3.14, 'en')).toBe('3.14');
    expect(formatNumber(-1200, 'en')).toBe('-1,200');
    expect(scheda('zimbabwe', 'en').getByText('1,775,088')).toBeTruthy();
    expect(scheda('italy', 'en').getByText('5,833')).toBeTruthy();
    const ucraina = scheda('ukraine', 'en');
    expect(ucraina.getByText('52,272')).toBeTruthy();
    expect(ucraina.getByText('4,100')).toBeTruthy();
  });
});
