import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthCityField } from '@/features/auth/components/AuthCityField';

/** Harness controllato che replica il legame value/onChange del form reale. */
const Harness: React.FC<{
  onSelect: (city: string, sigla: string) => void;
}> = ({ onSelect }) => {
  const [city, setCity] = useState('');
  return (
    <AuthCityField
      label="Città"
      value={city}
      onChangeCity={setCity}
      onSelectComune={(c, s): void => {
        setCity(c);
        onSelect(c, s);
      }}
    />
  );
};

describe('AuthCityField', () => {
  it('digitando un comune mostra i suggerimenti e la selezione emette nome + sigla', () => {
    const onSelect = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <AllProviders>
        <Harness onSelect={onSelect} />
      </AllProviders>
    );
    fireEvent.changeText(getByLabelText('Città'), 'Roma');
    fireEvent.press(getByTestId('city-option-0'));
    expect(onSelect).toHaveBeenCalledWith('Roma', 'RM');
  });

  it('sotto i 2 caratteri non propone suggerimenti', () => {
    const { getByLabelText, queryByTestId } = render(
      <AllProviders>
        <Harness onSelect={jest.fn()} />
      </AllProviders>
    );
    fireEvent.changeText(getByLabelText('Città'), 'R');
    expect(queryByTestId('city-option-0')).toBeNull();
  });
});
