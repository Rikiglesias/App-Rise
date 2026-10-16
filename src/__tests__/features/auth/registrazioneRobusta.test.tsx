import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { useSignUpForm } from '@/features/auth/hooks/useSignUpForm';
import { supabase } from '@/shared/auth/supabaseClient';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => false,
  }),
}));

// Termina il caricamento e conserva i dati per riprovare.
it('accesso robusto: Registrazione rete', async () => {
  (supabase.auth.signUp as jest.Mock).mockRejectedValueOnce(
    new Error('Network request failed')
  );
  const { result } = renderHook(() => useSignUpForm(), {
    wrapper: AllProviders,
  });
  act(() => {
    result.current.onChange.firstName('Mario');
    result.current.onChange.lastName('Rossi');
    result.current.onChange.email('mario@example.test');
    result.current.onChange.password('Abcd123!');
    result.current.onChange.confirmPassword('Abcd123!');
    result.current.onChange.phone('+393331234567');
    result.current.onChange.birthDate('2000-01-01');
    result.current.selectComune('Roma', 'RM');
    result.current.togglePrivacy();
  });

  act(() => result.current.handleSubmit());

  expect(supabase.auth.signUp).toHaveBeenCalled();
  await waitFor(() =>
    expect(result.current.submitError).toBe(i18n.t('auth.errors.network'))
  );
  expect(result.current.loading).toBe(false);
  expect(result.current.done).toBe(false);
  expect(result.current.values.email).toBe('mario@example.test');
  await act(async () => {
    result.current.handleSubmit();
    await Promise.resolve();
  });
  expect(result.current.done).toBe(true);
});
