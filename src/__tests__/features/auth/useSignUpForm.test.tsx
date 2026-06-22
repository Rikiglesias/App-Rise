import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { useSignUpForm } from '@/features/auth/hooks/useSignUpForm';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'unauthenticated',
    session: null,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateEmail: jest.fn(),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    recordConsent: jest.fn(),
    setMarketingConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    needsReConsent: false,
    acceptCurrentPolicy: jest.fn(),
    ...over,
  }) as AuthState;

type Hook = ReturnType<typeof useSignUpForm>;

// Compila il form con valori che superano validateSignUpForm (email/password/phone/
// adult/city+province/privacy). I valori hanno spazi dove rilevante per verificare il trim.
const fillValid = (result: { current: Hook }): void => {
  act(() => {
    result.current.onChange.firstName('  Mario  ');
    result.current.onChange.lastName('Rossi');
    result.current.onChange.email(' a@b.it ');
    result.current.onChange.password('Abcd123!');
    result.current.onChange.confirmPassword('Abcd123!');
    result.current.onChange.phone('+393331234567');
    result.current.onChange.birthDate('2000-01-01');
  });
  act(() => result.current.selectComune('Roma', 'RM'));
  act(() => result.current.togglePrivacy());
};

describe('useSignUpForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submit valido: chiama signUp con i campi trimmati e setta done', async () => {
    const signUp = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ signUp }));
    const { result } = renderHook(() => useSignUpForm(), {
      wrapper: AllProviders,
    });

    fillValid(result);
    await act(async () => {
      result.current.handleSubmit();
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.done).toBe(true));
    expect(signUp).toHaveBeenCalledWith(
      'a@b.it',
      'Abcd123!',
      expect.objectContaining({
        first_name: 'Mario',
        last_name: 'Rossi',
        phone: '+393331234567',
        city: 'Roma',
        province: 'RM',
        birth_date: '2000-01-01',
        privacy_consent: true,
      })
    );
    expect(result.current.submitError).toBeNull();
  });

  it('errore di signUp: submitError valorizzato, done resta false', async () => {
    const signUp = jest.fn().mockResolvedValue({ error: 'boom' });
    mockUseAuth.mockReturnValue(makeAuth({ signUp }));
    const { result } = renderHook(() => useSignUpForm(), {
      wrapper: AllProviders,
    });

    fillValid(result);
    await act(async () => {
      result.current.handleSubmit();
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.submitError).not.toBeNull());
    expect(result.current.done).toBe(false);
  });

  it('validazione fallita: signUp NON chiamato e errors popolato', async () => {
    const signUp = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ signUp }));
    const { result } = renderHook(() => useSignUpForm(), {
      wrapper: AllProviders,
    });

    // form vuoto → submit
    await act(async () => {
      result.current.handleSubmit();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
    );
    expect(signUp).not.toHaveBeenCalled();
  });
});
