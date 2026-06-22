import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthCountryField } from '@/features/auth/components/AuthCountryField';

// CountrySelect è una modale nativa: la mockiamo per un test deterministico.
// jest.mock è hoisted da babel sopra gli import → il mock si applica comunque.
jest.mock('rn-country-select', () => {
  const ReactLib = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  const FR = {
    cca2: 'FR',
    flag: '🇫🇷',
    name: { common: 'France' },
    translations: { ita: { common: 'Francia' }, eng: { common: 'France' } },
  };
  const IT = {
    cca2: 'IT',
    flag: '🇮🇹',
    name: { common: 'Italy' },
    translations: { ita: { common: 'Italia' }, eng: { common: 'Italy' } },
  };
  const CountrySelect = ({ visible, onSelect }: any) =>
    visible
      ? ReactLib.createElement(
          TouchableOpacity,
          { testID: 'pick-fr', onPress: () => onSelect(FR) },
          ReactLib.createElement(Text, null, 'Francia')
        )
      : null;
  return {
    __esModule: true,
    default: CountrySelect,
    getCountryByCca2: (code: string) => (code === 'IT' ? IT : FR),
  };
});

describe('AuthCountryField', () => {
  it('mostra il nome localizzato del valore corrente e apre il picker', () => {
    const onSelect = jest.fn();
    const { getByText, getByTestId, queryByTestId } = render(
      <AllProviders>
        <AuthCountryField label="Paese" value="IT" onSelect={onSelect} />
      </AllProviders>
    );
    expect(getByText(/Italia/)).toBeTruthy();
    expect(queryByTestId('pick-fr')).toBeNull();
    fireEvent.press(getByTestId('country-field'));
    fireEvent.press(getByTestId('pick-fr'));
    expect(onSelect).toHaveBeenCalledWith('FR');
  });
});
