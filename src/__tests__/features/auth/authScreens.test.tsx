import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { AuthLandingScreen } from '@/features/auth/screens/AuthLandingScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('Auth screens', () => {
  it('SignUp: render + mostra errori su submit con campi vuoti', () => {
    const { getByText, queryAllByText } = wrap(<SignUpScreen />);
    expect(getByText('Crea account')).toBeTruthy();
    fireEvent.press(getByText('Registrati'));
    expect(queryAllByText('Campo obbligatorio').length).toBeGreaterThan(0);
  });

  it('Login: render', () => {
    const { getAllByText } = wrap(<LoginScreen />);
    expect(getAllByText('Accedi').length).toBeGreaterThan(0);
  });

  it('ForgotPassword: render', () => {
    const { getByText } = wrap(<ForgotPasswordScreen />);
    expect(getByText('Recupera password')).toBeTruthy();
  });

  it('AuthLanding: render', () => {
    const { getByText } = wrap(<AuthLandingScreen />);
    expect(getByText('Area Donatori')).toBeTruthy();
  });

  it('Profile: senza sessione mostra la landing', async () => {
    const { findByText } = wrap(<ProfileScreen />);
    expect(await findByText('Area Donatori')).toBeTruthy();
  });
});
