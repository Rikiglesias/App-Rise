// C95 (contratto android-play, R27-R28): in «Modifica profilo» la data di nascita si sceglie
// col selettore, come in registrazione e in Completa profilo. File NUOVO (regola R27).
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const profiloCon = (birthDate: string): Profile => ({
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: birthDate,
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: 'mario@r.it',
  nickname: null,
});

let updateProfile: jest.Mock;
const montaCon = (birthDate: string) => {
  jest.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'mario@r.it', identities: [] },
    } as unknown as Session,
    profile: profiloCon(birthDate),
    profileError: null,
    refreshProfile: jest.fn(),
    updateProfile,
    updateEmail: jest.fn().mockResolvedValue({ error: null }),
  } as unknown as AuthState);
  return render(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = 'it';
  updateProfile = jest.fn().mockResolvedValue({ error: null });
});

it('profilo: data di nascita col selettore', async () => {
  const ui = montaCon('1985-05-20');
  // Niente testo libero: né il valore grezzo in un campo né il vecchio esempio da copiare.
  expect(ui.queryByDisplayValue('1985-05-20')).toBeNull();
  expect(ui.queryByPlaceholderText('2000-01-31')).toBeNull();
  const campo = ui.getByLabelText('Data di nascita');
  expect(campo.props.accessibilityRole).toBe('button');
  expect(ui.getByText('20/05/1985')).toBeTruthy();

  fireEvent.press(campo);
  // Il finto selettore di jest.setup.js conferma sempre il 1° gennaio 1990.
  fireEvent.press(ui.getByTestId('date-picker'));
  expect(ui.getByText('01/01/1990')).toBeTruthy();

  fireEvent.press(ui.getByText('Salva modifiche'));
  await waitFor(() =>
    expect(updateProfile).toHaveBeenCalledWith({ birth_date: '1990-01-01' })
  );
  await act(async () => {
    await Promise.resolve();
  });
});

it('profilo: data illeggibile → selettore vuoto, nessun crash', () => {
  // `01/02/2000` è il rilievo d-4 (diventava il 2 gennaio); `2000-02-30` in Node è il 1° marzo.
  const illeggibili = [
    '2000-02-30',
    '1999-02-29',
    '2000-1-5',
    '01/02/2000',
    '',
    null,
  ];
  const predefinita = new Date();
  predefinita.setFullYear(predefinita.getFullYear() - 18);
  for (const valore of illeggibili) {
    const ui = montaCon(valore as string);
    const campo = ui.getByLabelText('Data di nascita');
    expect(campo.props.accessibilityRole).toBe('button');
    expect(campo.props.accessibilityValue).toEqual({ text: '' });
    expect(
      ui.getByText(i18n.t('auth.signup.birthDatePlaceholder'))
    ).toBeTruthy();

    fireEvent.press(campo);
    const aperto = ui.UNSAFE_getByType(DateTimePicker).props.value as Date;
    expect([aperto.getFullYear(), aperto.getMonth(), aperto.getDate()]).toEqual(
      [predefinita.getFullYear(), predefinita.getMonth(), predefinita.getDate()]
    );
    ui.unmount();
  }
});

it('profilo: data illeggibile mai toccata → Salva si ferma con Data non valida', async () => {
  const ui = montaCon('2000-02-30');
  fireEvent.changeText(ui.getByLabelText('Telefono'), '+393339998877');
  fireEvent.press(ui.getByText('Salva modifiche'));
  await ui.findByText(i18n.t('auth.errors.date_invalid'));
  expect(updateProfile).not.toHaveBeenCalled();
});

it('profilo: il selettore si apre sul giorno salvato anche a ovest di Greenwich', () => {
  // `process.env` di Jest è una copia: il fuso si cambia sul process VERO del worker.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vero = require('node:vm').runInThisContext('process') as NodeJS.Process;
  const fusoDiPartenza = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    vero.env.TZ = 'America/Sao_Paulo';
    // Controllo positivo: senza, se il cambio non agisse, il test girerebbe a Roma, dove
    // il difetto non si vede.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      'America/Sao_Paulo'
    );
    expect(new Date('1985-05-20').getDate()).toBe(19);

    const ui = montaCon('1985-05-20');
    fireEvent.press(ui.getByLabelText('Data di nascita'));
    const aperto = ui.UNSAFE_getByType(DateTimePicker).props.value as Date;
    expect([aperto.getFullYear(), aperto.getMonth(), aperto.getDate()]).toEqual(
      [1985, 4, 20]
    );
  } finally {
    // Per nome, mai `delete`: su Windows riporterebbe a UTC, non al fuso di partenza.
    vero.env.TZ = fusoDiPartenza;
  }
});
