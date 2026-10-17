import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import type { Profile } from '@/shared/auth/types';
import itLocale from '@/locales/it';

const Stack = createStackNavigator();
const profile: Profile = {
  id: 'account-offline',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  contact_email: 'mario@example.org',
  nickname: null,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
};
const readProfile = jest.fn();
const updateProfile = jest.fn();
const insertConsent = jest.fn();
const upsertProfile = jest.fn();
const deleteAccount = jest.fn();
const network = () => new TypeError('Network request failed');

const Ready: React.FC<{
  children: React.ReactNode;
  waitForProfile: boolean;
}> = ({ children, waitForProfile }) => {
  const auth = useAuth();
  if (
    auth.status !== 'authenticated' ||
    (waitForProfile && !auth.profileLoaded)
  )
    return null;
  return <>{children}</>;
};

const mount = (component: React.ReactElement, waitForProfile = true) => {
  const navigation = createNavigationContainerRef();
  const onStateChange = jest.fn();
  const view = render(
    <AllProviders>
      <NavigationContainer ref={navigation} onStateChange={onStateChange}>
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'none' }}
        >
          <Stack.Screen name="Account">
            {() => <Ready waitForProfile={waitForProfile}>{component}</Ready>}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </AllProviders>
  );
  return { ...view, navigation, onStateChange };
};

beforeEach(() => {
  jest.clearAllMocks();
  readProfile.mockReset().mockResolvedValue({ data: profile, error: null });
  updateProfile.mockReset().mockResolvedValue({ error: null });
  insertConsent.mockReset().mockResolvedValue({ error: null });
  upsertProfile.mockReset().mockResolvedValue({ error: null });
  deleteAccount.mockReset().mockResolvedValue({ error: null });
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: { user: { id: profile.id, email: 'mario@example.org' } } },
    error: null,
  });
  (supabase.auth.signOut as jest.Mock)
    .mockReset()
    .mockResolvedValue({ error: null });
  (supabase.auth.updateUser as jest.Mock)
    .mockReset()
    .mockResolvedValue({ data: { user: null }, error: null });
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'profiles')
      return {
        select: () => ({ eq: () => ({ single: readProfile }) }),
        update: (fields: unknown) => ({
          eq: (key: string, id: string) => updateProfile(fields, key, id),
        }),
        upsert: upsertProfile,
      };
    if (table === 'consent_events')
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: insertConsent,
      };
    return {
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { is_material: true }, error: null }),
        }),
      }),
    };
  });
  Object.assign(supabase, { functions: { invoke: deleteAccount } });
});

afterEach(() => jest.restoreAllMocks());

// Dopo una scrittura riuscita il nickname occupato è già nostro: prima si rilegge,
// poi si termina il cambio email rimasto in sospeso senza riscrivere il profilo.
it('modifica offline: rilegge il nickname salvato e termina il cambio email', async () => {
  readProfile
    .mockResolvedValueOnce({ data: profile, error: null })
    .mockRejectedValueOnce(network())
    .mockResolvedValue({
      data: { ...profile, nickname: 'mario_nuovo' },
      error: null,
    });
  const rpc = jest.fn().mockResolvedValue({ data: false, error: null });
  Object.assign(supabase, { rpc });
  const view = mount(<ProfileEditScreen />);
  await view.findByDisplayValue('Rossi');
  jest.useFakeTimers();
  try {
    fireEvent.changeText(
      view.getByLabelText(itLocale.auth.signup.nickname),
      'mario_nuovo'
    );
    fireEvent.changeText(
      view.getByLabelText(itLocale.auth.login.email),
      'nuova@example.org'
    );
    fireEvent.press(view.getByText(itLocale.auth.edit.save));
    expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(450);
    });
    expect(rpc).toHaveBeenCalled();
    fireEvent.press(view.getByText(itLocale.common.retry));
    // Col cambio email il successo si dice con l'avviso della doppia conferma.
    expect(await view.findByText(itLocale.auth.edit.emailNotice)).toBeTruthy();
    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(supabase.auth.updateUser).toHaveBeenCalledWith(
      { email: 'nuova@example.org' },
      expect.objectContaining({ emailRedirectTo: expect.any(String) })
    );
    expect(readProfile).toHaveBeenCalledTimes(3);
    expect(view.onStateChange).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});

it('account offline: Modifica profilo', async () => {
  updateProfile.mockResolvedValueOnce({ error: network() });
  const view = mount(<ProfileEditScreen />);
  fireEvent.changeText(await view.findByDisplayValue('Rossi'), 'Bianchi');
  fireEvent.press(view.getByText(itLocale.auth.edit.save));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(view.getByDisplayValue('Bianchi')).toBeTruthy();
  expect(updateProfile).toHaveBeenCalledTimes(1);
  expect(view.onStateChange).not.toHaveBeenCalled();
  const before = view.navigation.getRootState();
  fireEvent.press(view.getByText(itLocale.common.retry));
  expect(await view.findByText(itLocale.auth.edit.success)).toBeTruthy();
  expect(updateProfile).toHaveBeenCalledTimes(2);
  expect(updateProfile.mock.calls[1]).toEqual(updateProfile.mock.calls[0]);
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(view.navigation.getRootState()).toEqual(before);
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('account offline: Elimina account', async () => {
  deleteAccount.mockResolvedValueOnce({
    error: {
      name: 'FunctionsFetchError',
      message: 'Failed to send a request to the Edge Function',
      context: network(),
    },
  });
  const alert = jest.spyOn(Alert, 'alert');
  const view = mount(<DeleteAccountScreen />);
  fireEvent.press(await view.findByText(itLocale.auth.delete.now));
  const confirm = async () => {
    const buttons = alert.mock.calls[alert.mock.calls.length - 1]?.[2];
    const accept = buttons?.find(button => button.style === 'destructive');
    expect(accept?.onPress).toBeDefined();
    await act(() => {
      accept?.onPress?.();
    });
  };
  await confirm();
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(deleteAccount).toHaveBeenCalledTimes(1);
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
  const before = view.navigation.getRootState();
  fireEvent.press(view.getByText(itLocale.common.retry));
  expect(deleteAccount).toHaveBeenCalledTimes(1);
  await confirm();
  await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(2));
  expect(deleteAccount.mock.calls[1]).toEqual(['delete-account', { body: {} }]);
  expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(view.navigation.getRootState()).toEqual(before);
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('account offline: Ri-consenso', async () => {
  insertConsent.mockRejectedValueOnce(network());
  const view = mount(<ReConsentScreen />);
  fireEvent.press(
    await view.findByText(itLocale.auth.consents.reconsentAccept)
  );
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(insertConsent).toHaveBeenCalledTimes(1);
  const before = view.navigation.getRootState();
  fireEvent.press(view.getByText(itLocale.common.retry));
  await waitFor(() => expect(insertConsent).toHaveBeenCalledTimes(2));
  expect(insertConsent.mock.calls[1]).toEqual(insertConsent.mock.calls[0]);
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(view.navigation.getRootState()).toEqual(before);
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('cambio email offline conserva il valore e ripete la chiamata rigettata', async () => {
  (supabase.auth.updateUser as jest.Mock).mockRejectedValueOnce(network());
  const view = mount(<ProfileEditScreen />);
  await view.findByDisplayValue('Rossi');
  fireEvent.changeText(
    view.getByLabelText(itLocale.auth.edit.email),
    'nuova@example.org'
  );
  fireEvent.press(view.getByText(itLocale.auth.edit.save));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(view.getByDisplayValue('nuova@example.org')).toBeTruthy();
  fireEvent.press(view.getByText(itLocale.common.retry));
  expect(await view.findByText(itLocale.auth.edit.emailNotice)).toBeTruthy();
  expect(supabase.auth.updateUser).toHaveBeenCalledTimes(2);
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('ri-consenso: il retry di Esci ripete solo il logout fallito', async () => {
  (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
    error: network(),
  });
  const view = mount(<ReConsentScreen />);
  fireEvent.press(await view.findByText(itLocale.auth.consents.signOut));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  fireEvent.press(view.getByText(itLocale.common.retry));
  await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledTimes(2));
  expect(insertConsent).not.toHaveBeenCalled();
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('completamento profilo offline conserva i dati e ripete upsert', async () => {
  upsertProfile.mockRejectedValueOnce(network());
  const view = mount(<CompleteProfileScreen />);
  fireEvent.changeText(await view.findByDisplayValue('Rossi'), 'Bianchi');
  fireEvent.press(view.getByText(itLocale.auth.completeProfile.submit));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(view.getByDisplayValue('Bianchi')).toBeTruthy();
  fireEvent.press(view.getByText(itLocale.common.retry));
  await waitFor(() => expect(upsertProfile).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(view.queryByText(itLocale.auth.errors.network)).toBeNull()
  );
  expect(upsertProfile.mock.calls[1]).toEqual(upsertProfile.mock.calls[0]);
  expect(insertConsent).not.toHaveBeenCalled();
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('lettura profilo offline: Riprova rilegge senza scritture o navigazione', async () => {
  readProfile.mockResolvedValueOnce({ data: null, error: network() });
  const view = mount(<CompleteProfileScreen />, false);
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  fireEvent.press(view.getByText(itLocale.common.retry));
  expect(await view.findByDisplayValue('Rossi')).toBeTruthy();
  expect(readProfile).toHaveBeenCalledTimes(2);
  expect(upsertProfile).not.toHaveBeenCalled();
  expect(insertConsent).not.toHaveBeenCalled();
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('completamento: il retry del logout rigettato ripete solo Esci', async () => {
  readProfile.mockResolvedValue({
    data: { ...profile, phone: '' },
    error: null,
  });
  (supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(network());
  const view = mount(<CompleteProfileScreen />);
  fireEvent.press(await view.findByText(itLocale.auth.profile.logout));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  fireEvent.press(view.getByText(itLocale.common.retry));
  await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledTimes(2));
  expect(view.queryByText(itLocale.auth.errors.network)).toBeNull();
  expect(upsertProfile).not.toHaveBeenCalled();
  expect(view.onStateChange).not.toHaveBeenCalled();
});

it('rilettura dopo salvataggio offline: Riprova non riscrive il profilo', async () => {
  readProfile
    .mockResolvedValueOnce({ data: profile, error: null })
    .mockRejectedValueOnce(network());
  const view = mount(<CompleteProfileScreen />);
  fireEvent.changeText(await view.findByDisplayValue('Rossi'), 'Bianchi');
  fireEvent.press(view.getByText(itLocale.auth.completeProfile.submit));
  expect(await view.findByText(itLocale.auth.errors.network)).toBeTruthy();
  expect(upsertProfile).toHaveBeenCalledTimes(1);
  expect(view.getAllByText(itLocale.common.retry)).toHaveLength(1);
  fireEvent.press(view.getByText(itLocale.common.retry));
  await waitFor(() =>
    expect(view.queryByText(itLocale.auth.errors.network)).toBeNull()
  );
  expect(readProfile).toHaveBeenCalledTimes(3);
  expect(upsertProfile).toHaveBeenCalledTimes(1);
  expect(insertConsent).not.toHaveBeenCalled();
  expect(view.getByDisplayValue('Bianchi')).toBeTruthy();
  expect(view.onStateChange).not.toHaveBeenCalled();
});
