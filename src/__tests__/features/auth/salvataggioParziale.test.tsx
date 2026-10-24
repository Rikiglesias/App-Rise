import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const partialMessage =
  'I dati del profilo sono stati salvati, ma l’email non è cambiata. Riprova il cambio email.';
const updateProfile = jest.fn();
const updateEmail = jest.fn();
beforeEach(() => {
  i18n.locale = 'it';
  updateProfile.mockReset().mockResolvedValue({ error: null });
  updateEmail.mockReset().mockResolvedValue({ error: 'boom' });
  jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
  jest.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'old@example.test', identities: [] },
    } as unknown as Session,
    profile: {
      id: 'u1',
      first_name: 'Mario',
      last_name: 'Rossi',
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      country: 'IT',
      birth_date: '1990-01-01',
      privacy_consent_at: '2026-01-01T00:00:00Z',
      marketing_consent: false,
      deletion_requested_at: null,
      contact_email: 'mario@example.test',
      nickname: null,
    },
    profileLoaded: true,
    profileError: null,
    updateProfile,
    updateEmail,
  } as unknown as AuthState);
});
afterEach(() => {
  jest.restoreAllMocks();
  i18n.locale = 'it';
});

const submit = (changeProfile = true) => {
  const ui = render(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
  if (changeProfile)
    fireEvent.changeText(
      ui.getByLabelText(i18n.t('auth.signup.firstName')),
      'Maria'
    );
  fireEvent.changeText(
    ui.getByLabelText(i18n.t('auth.edit.email')),
    'new@example.test'
  );
  fireEvent.press(ui.getByText(i18n.t('auth.edit.save')));
  return ui;
};

it('salvataggio parziale: dice cosa è salvato', async () => {
  const ui = submit();
  expect(await ui.findByText(partialMessage)).toBeTruthy();
  expect(updateProfile).toHaveBeenCalledWith({ first_name: 'Maria' });
  expect(updateEmail).toHaveBeenCalledWith('new@example.test');
  expect(i18n.t('auth.edit.partialSave')).toBe(partialMessage);
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
    partialMessage
  );
});

it('salvataggio parziale: col motivo quando il rifiuto è specifico', async () => {
  updateEmail.mockResolvedValueOnce({
    error: { message: 'User already registered' },
  });
  const ui = submit();
  expect(
    await ui.findByText(
      i18n.t('auth.edit.partialSaveReason', {
        reason: i18n.t('auth.errors.already_registered'),
      })
    )
  ).toBeTruthy();
});

it('salvataggio parziale: anche se il cambio email rigetta', async () => {
  updateEmail.mockRejectedValueOnce(new Error('Network request failed'));
  const ui = submit();
  expect(
    await ui.findByText(
      i18n.t('auth.edit.partialSaveReason', {
        reason: i18n.t('auth.errors.network'),
      })
    )
  ).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Riprova' })).toBeTruthy();
});

it('salvataggio parziale: traduzione inglese effettiva', async () => {
  i18n.locale = 'en';
  const ui = submit();
  expect(
    await ui.findByText(
      'Your profile details were saved, but your email address has not changed. Try changing your email again.'
    )
  ).toBeTruthy();
});

it('salvataggio parziale: solo email fallita non dichiara dati salvati', async () => {
  const ui = submit(false);
  expect(
    await ui.findByText('Aggiornamento non riuscito. Riprova.')
  ).toBeTruthy();
  expect(updateProfile).not.toHaveBeenCalled();
  expect(ui.queryByText(partialMessage)).toBeNull();
});

it('salvataggio parziale: profilo fallito non dichiara dati salvati', async () => {
  updateProfile.mockResolvedValueOnce({ error: 'boom' });
  const ui = submit();
  expect(
    await ui.findByText('Aggiornamento non riuscito. Riprova.')
  ).toBeTruthy();
  expect(updateEmail).not.toHaveBeenCalled();
  expect(ui.queryByText(partialMessage)).toBeNull();
});
