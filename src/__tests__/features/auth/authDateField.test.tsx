import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AllProviders } from '../../helpers/testProviders';
import { AuthDateField } from '@/features/auth/components/AuthDateField';
import i18n from '@/locales';

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

const noop = (): void => undefined;

describe('AuthDateField', () => {
  afterEach(() => {
    i18n.locale = 'it';
  });

  it('uses an English picker and dismiss label in English', () => {
    i18n.locale = 'en';
    const { getByLabelText, queryByTestId, UNSAFE_getByType } = wrap(
      <AuthDateField label="Birth date" value="" onChange={noop} />
    );

    fireEvent.press(getByLabelText('Birth date'));
    expect(UNSAFE_getByType(DateTimePicker).props.locale).toBe('en-GB');
    fireEvent.press(getByLabelText('Close date picker'));
    expect(queryByTestId('date-picker')).toBeNull();
  });

  it('mostra il placeholder quando non c’è valore', () => {
    const { getByText } = wrap(
      <AuthDateField
        label="Data di nascita"
        value=""
        onChange={noop}
        placeholder="Seleziona la data"
      />
    );
    expect(getByText('Seleziona la data')).toBeTruthy();
  });

  it('mostra il valore (ISO) formattato in GG/MM/AAAA', () => {
    const { getByText } = wrap(
      <AuthDateField
        label="Data di nascita"
        value="1985-05-20"
        onChange={noop}
        placeholder="Seleziona la data"
      />
    );
    // Il valore resta ISO internamente, ma a video è in formato italiano.
    expect(getByText('20/05/1985')).toBeTruthy();
  });

  it('apre il picker e propaga la data ISO selezionata', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByTestId, queryByTestId } = wrap(
      <AuthDateField
        label="Data di nascita"
        value=""
        onChange={onChange}
        placeholder="Seleziona la data"
      />
    );
    // Picker non montato finché il campo non viene aperto.
    expect(queryByTestId('date-picker')).toBeNull();
    fireEvent.press(getByLabelText('Data di nascita'));
    fireEvent.press(getByTestId('date-picker'));
    expect(onChange).toHaveBeenCalledWith('1990-01-01');
  });
});
