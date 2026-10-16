import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import i18n from '@/locales';

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/hooks/useDeviceType', () => ({ useDeviceType: jest.fn() }));

const Stack = createStackNavigator();
const mount = (component: React.ComponentType) =>
  render(
    <AllProviders>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="TestForm"
            component={component}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AllProviders>
  );

beforeEach(() => {
  i18n.locale = 'it';
  jest.mocked(useDeviceType).mockReturnValue({
    deviceType: 'large',
    isSmall: false,
    isNormal: false,
    isLarge: true,
    isTablet: true,
    isPhone: false,
    width: 1280,
    height: 800,
  });
  jest.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    profileLoaded: true,
    needsReConsent: false,
    session: { user: { id: 'u1', email: 'mario@example.it' } },
    profile: {
      id: 'u1',
      first_name: 'Mario',
      last_name: 'Rossi',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      country: 'IT',
      birth_date: '1990-03-25',
      contact_email: 'mario@example.it',
      nickname: null,
      marketing_consent: false,
      privacy_consent_at: '2026-01-01T00:00:00Z',
      deletion_requested_at: null,
    },
  } as AuthState);
});

it('moduli account: larghezza massima 560 dp su tablet', () => {
  for (const screen of [
    LoginScreen,
    SignUpScreen,
    ForgotPasswordScreen,
    ResetPasswordScreen,
    ProfileScreen,
    ProfileEditScreen,
    CompleteProfileScreen,
  ]) {
    const ui = mount(screen);
    const style = StyleSheet.flatten(
      ui.getByTestId('auth-content').props.style
    );
    expect(style.maxWidth).toBe(560);
    expect(style.alignSelf).toBe('center');
    expect(style.width).toBe('100%');
    ui.unmount();
  }
  jest.mocked(useDeviceType).mockReturnValue({
    deviceType: 'normal',
    isSmall: false,
    isNormal: true,
    isLarge: false,
    isTablet: false,
    isPhone: true,
    width: 393,
    height: 852,
  });
  const phone = mount(LoginScreen);
  expect(
    StyleSheet.flatten(phone.getByTestId('auth-content').props.style).maxWidth
  ).toBeUndefined();
  expect(phone.getByLabelText(i18n.t('auth.login.email'))).toBeTruthy();
});

it('moduli account: data nel formato della lingua', () => {
  for (const [locale, date] of [
    ['it', '25 marzo 1990'],
    ['en', 'March 25, 1990'],
  ] as const) {
    i18n.locale = locale;
    const ui = mount(ProfileScreen);
    expect(ui.getByText(date)).toBeTruthy();
    expect(ui.queryByText('1990-03-25')).toBeNull();
    ui.unmount();
  }
});

it('moduli account: suggerimenti per i gestori di password', () => {
  const cases = [
    [
      LoginScreen,
      [
        ['auth.login.email', 'email', 'emailAddress'],
        ['auth.login.password', 'current-password', 'password'],
      ],
    ],
    [
      SignUpScreen,
      [
        ['auth.signup.email', 'email', 'emailAddress'],
        ['auth.signup.password', 'new-password', 'newPassword'],
        ['auth.signup.confirmPassword', 'new-password', 'newPassword'],
      ],
    ],
    [ForgotPasswordScreen, [['auth.login.email', 'email', 'emailAddress']]],
    [
      ResetPasswordScreen,
      [
        ['auth.reset.newPassword', 'new-password', 'newPassword'],
        ['auth.reset.confirmPassword', 'new-password', 'newPassword'],
      ],
    ],
    [
      ProfileEditScreen,
      [
        ['auth.edit.email', 'email', 'emailAddress'],
        ['auth.completeProfile.contactEmail', 'email', 'emailAddress'],
      ],
    ],
    [
      CompleteProfileScreen,
      [['auth.completeProfile.contactEmail', 'email', 'emailAddress']],
    ],
  ] as const;
  for (const [screen, fields] of cases) {
    const ui = mount(screen);
    for (const [label, autoComplete, textContentType] of fields) {
      const input = ui.getByLabelText(i18n.t(label));
      expect(input.props.autoComplete).toBe(autoComplete);
      expect(input.props.textContentType).toBe(textContentType);
    }
    ui.unmount();
  }
});
