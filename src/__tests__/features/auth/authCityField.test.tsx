import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthCityField } from '@/features/auth/components/AuthCityField';

/** Harness controllato che replica il legame value/onChange del form reale. */
const Harness: React.FC<{
  onSelect: (city: string, sigla: string) => void;
  country?: string;
}> = ({ onSelect, country = 'IT' }) => {
  const [city, setCity] = useState('');
  return (
    <AuthCityField
      label="Città"
      value={city}
      country={country}
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

  it('paese estero: nessun dropdown comuni, solo testo libero', () => {
    const onChangeCity = jest.fn();
    const Foreign: React.FC = () => {
      const [city, setCity] = useState('Par');
      return (
        <AuthCityField
          label="Città"
          value={city}
          country="FR"
          onChangeCity={(v): void => {
            setCity(v);
            onChangeCity(v);
          }}
          onSelectComune={jest.fn()}
        />
      );
    };
    const { queryByTestId, getByLabelText } = render(
      <AllProviders>
        <Foreign />
      </AllProviders>
    );
    // 'Par' matcherebbe comuni IT (es. Parma) → con country estero NON deve.
    expect(queryByTestId('city-option-0')).toBeNull();
    fireEvent.changeText(getByLabelText('Città'), 'Paris');
    expect(onChangeCity).toHaveBeenCalledWith('Paris');
  });
});
