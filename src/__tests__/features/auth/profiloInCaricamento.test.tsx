/**
 * C75 (contratto android-play): finché il profilo non è arrivato (`profileLoaded` falso) la pagina
 * Profilo mostra un'attesa al posto dei dati e delle azioni che ne dipendono, e l'interruttore del
 * consenso marketing non si può toccare né mostra «spento» come se fosse la scelta della persona.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import i18n from '@/locales';

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const setMarketingConsent = jest.fn().mockResolvedValue({ error: null });

const profilo = {
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
  marketing_consent: true,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  deletion_requested_at: null,
};

const auth = (profileLoaded: boolean) =>
  ({
    status: 'authenticated',
    profileLoaded,
    needsReConsent: false,
    session: { user: { id: 'u1', email: 'mario@example.it' } },
    profile: profileLoaded ? profilo : null,
    setMarketingConsent,
  }) as unknown as AuthState;

const Stack = createStackNavigator();
const monta = () =>
  render(
    <AllProviders>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Profilo"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AllProviders>
  );

beforeEach(() => {
  i18n.locale = 'it';
  setMarketingConsent.mockClear();
});

describe('C75 profilo in caricamento', () => {
  it('profilo: attesa visibile finché il profilo non arriva', () => {
    jest.mocked(useAuth).mockReturnValue(auth(false));
    const ui = monta();
    // Due attese: al posto di dati e azioni del profilo, e al posto dell'interruttore.
    expect(ui.queryAllByLabelText(i18n.t('common.loading')).length).toBe(2);
    expect(ui.queryByText(i18n.t('auth.edit.title'))).toBeNull();
    expect(ui.queryByText(i18n.t('auth.profile.completeCta'))).toBeNull();
    expect(ui.queryByText(i18n.t('auth.profile.phone'))).toBeNull();

    jest.mocked(useAuth).mockReturnValue(auth(true));
    ui.rerender(
      <AllProviders>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Profilo"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AllProviders>
    );
    expect(ui.queryByLabelText(i18n.t('common.loading'))).toBeNull();
    expect(ui.getByText(i18n.t('auth.edit.title'))).toBeTruthy();
    expect(ui.getByText(i18n.t('auth.profile.phone'))).toBeTruthy();
  });

  it('consenso marketing: fermo finché il profilo non arriva', () => {
    jest.mocked(useAuth).mockReturnValue(auth(false));
    const ui = monta();
    const interruttore = ui.queryByRole('switch', {
      name: i18n.t('auth.consents.marketing'),
    });
    // Montato, sarebbe un «spento» che nessuno ha scelto; se c'è, deve essere fermo e dirlo.
    if (interruttore) {
      expect(interruttore.props.value).not.toBe(false);
      fireEvent(interruttore, 'valueChange', true);
    }
    expect(setMarketingConsent).not.toHaveBeenCalled();
    expect(interruttore).toBeNull();
  });
});
