import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return <Text>{authRef.status}</Text>;
};
const getAuth = (): AuthState => {
  if (!authRef) throw new Error('authRef non inizializzato');
  return authRef;
};
const renderAuth = () =>
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );

describe('AuthContext — recovery password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authRef = undefined;
  });

  it('resetPassword passa il redirectTo (deep link) a resetPasswordForEmail', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      const res = await getAuth().resetPassword('mario@rossi.it');
      expect(res.error).toBeNull();
    });
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'mario@rossi.it',
      { redirectTo: 'rahitalia://reset-password' }
    );
  });

  it('resetPassword propaga l’errore di Supabase', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: { message: 'boom' },
    });
    await act(async () => {
      const res = await getAuth().resetPassword('m@r.it');
      expect(res.error).toBe('boom');
    });
  });

  it('updatePassword chiama updateUser({password}) e propaga l’errore', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      const res = await getAuth().updatePassword('abcd1234');
      expect(res.error).toBeNull();
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'abcd1234',
    });

    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'weak' },
    });
    await act(async () => {
      const res = await getAuth().updatePassword('short');
      expect(res.error).toBe('weak');
    });
  });

  it('completeRecoveryFromUrl stabilisce la sessione su URL di recovery', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      const res = await getAuth().completeRecoveryFromUrl(
        'rahitalia://reset-password#access_token=AAA&refresh_token=BBB&type=recovery'
      );
      expect(res.ok).toBe(true);
    });
    expect(supabase.auth.setSession).toHaveBeenCalledWith({
      access_token: 'AAA',
      refresh_token: 'BBB',
    });
  });

  it('completeRecoveryFromUrl ignora URL non-recovery (ok:false, no setSession)', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      const res = await getAuth().completeRecoveryFromUrl(
        'rahitalia://reset-password'
      );
      expect(res.ok).toBe(false);
    });
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
  });
});
