import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';
import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    getState: () => ({ routeNames: [] }),
  }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUpsert = jest.fn();
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    from: () => ({ upsert: mockUpsert }),
    rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
    auth: { updateUser: jest.fn().mockResolvedValue({ error: null }) },
  },
}));

const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  contact_email: 'mario@example.test',
  nickname: null,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
};

type Result = { error: Error | null };
const deferred = () => {
  let reject!: (reason: Error) => void;
  const promise = new Promise<Result>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  return { promise, reject };
};
type UI = ReturnType<typeof render>;
const fillAccount = (ui: UI): void => {
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
};
const fillProfile = (ui: UI): void =>
  fillValidProfileForm(ui.getByLabelText, ui.getByRole, ui.getByTestId);

const cases = [
  {
    name: 'Accesso',
    Screen: LoginScreen,
    action: 'signIn',
    button: 'Accedi',
    field: 'Password',
    fill: fillAccount,
  },
  {
    name: 'Registrazione',
    Screen: SignUpScreen,
    action: 'signUp',
    button: 'Registrati',
    field: 'Città',
    fill: (ui: UI) => {
      fillAccount(ui);
      fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
      fillValidProfileForm(
        ui.getByLabelText,
        () => ui.getAllByRole('checkbox')[0],
        ui.getByTestId
      );
    },
  },
  {
    name: 'Password dimenticata',
    Screen: ForgotPasswordScreen,
    action: 'resetPassword',
    button: 'Invia link di reset',
    field: 'Email',
    fill: (ui: UI) => {
      fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
    },
  },
  {
    name: 'Reimposta password',
    Screen: ResetPasswordScreen,
    action: 'updatePassword',
    button: 'Salva password',
    field: 'Conferma password',
    fill: (ui: UI) => {
      fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
      fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
    },
  },
  {
    name: 'Modifica profilo',
    Screen: ProfileEditScreen,
    action: 'updateProfile',
    button: 'Salva modifiche',
    field: 'Nickname (facoltativo)',
    fill: (ui: UI) => {
      fireEvent.changeText(ui.getByLabelText('Nome'), 'Maria');
    },
  },
  {
    name: 'Completa profilo',
    Screen: CompleteProfileScreen,
    action: 'upsert',
    button: 'Salva e continua',
    field: 'Email di contatto',
    fill: fillProfile,
  },
] as const;

const prepare = (item: (typeof cases)[number]) => {
  const first = deferred();
  const next = deferred();
  const request = item.action === 'upsert' ? mockUpsert : jest.fn();
  request.mockReset().mockImplementation(() => first.promise);
  jest.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'mario@example.test' } } as Session,
    profile: item.action === 'updateProfile' ? profile : null,
    profileLoaded: true,
    refreshProfile: jest.fn().mockResolvedValue(null),
    recordConsent: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    [item.action]: request,
  } as unknown as AuthState);
  const ui = render(
    <AllProviders>
      <item.Screen />
    </AllProviders>
  );
  item.fill(ui);
  return { ui, request, first, next };
};

const verifySubmissions = async (
  item: (typeof cases)[number]
): Promise<void> => {
  const { ui, request, first, next } = prepare(item);
  const button = ui.getByRole('button', { name: item.button });
  const field = ui.getByLabelText(item.field);
  try {
    // Un solo act tiene tastiera e due pressioni nello stesso frame: loading non basta.
    act(() => {
      fireEvent(field, 'submitEditing');
      expect(request).toHaveBeenCalledTimes(1);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(request).toHaveBeenCalledTimes(1);
    });
    expect(field.props.onSubmitEditing).toEqual(expect.any(Function));
    expect(field.props.returnKeyType).toBe('done');
    await act(async () => {
      first.reject(new Error('Richiesta fallita'));
      await Promise.allSettled([first.promise]);
    });
    await waitFor(() => expect(button).toBeEnabled());
    request.mockImplementation(() => next.promise);
    fireEvent.press(button);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  } finally {
    await act(async () => {
      first.reject(new Error('Richiesta fallita'));
      next.reject(new Error('Richiesta fallita'));
      await Promise.allSettled([first.promise, next.promise]);
    });
  }
};

it.each(cases)(
  "doppio invio: $name chiama una volta sola e si libera dopo l'errore",
  verifySubmissions
);
