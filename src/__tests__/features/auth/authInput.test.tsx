import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthInput } from '@/features/auth/components/AuthInput';

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

const noop = (): void => undefined;

describe('AuthInput — toggle password', () => {
  it('campo password: parte nascosto e il toggle rivela/ri-nasconde', () => {
    const { getByLabelText, queryByLabelText } = wrap(
      <AuthInput
        label="Password"
        value="segreta1"
        onChangeText={noop}
        secureTextEntry
      />
    );
    const input = getByLabelText('Password');
    expect(input.props.secureTextEntry).toBe(true);

    // Toggle presente con label "mostra"
    fireEvent.press(getByLabelText('Mostra password'));
    expect(getByLabelText('Password').props.secureTextEntry).toBe(false);

    // Ora la label diventa "nascondi" e ri-nasconde
    fireEvent.press(getByLabelText('Nascondi password'));
    expect(getByLabelText('Password').props.secureTextEntry).toBe(true);
    expect(queryByLabelText('Nascondi password')).toBeNull();
  });

  it('campo non-password: nessun toggle', () => {
    const { queryByLabelText, getByLabelText } = wrap(
      <AuthInput label="Email" value="" onChangeText={noop} />
    );
    expect(getByLabelText('Email').props.secureTextEntry).toBe(false);
    expect(queryByLabelText('Mostra password')).toBeNull();
  });
});
