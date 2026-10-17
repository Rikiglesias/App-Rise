import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import type { Profile } from '@/shared/auth/types';
import { logger } from '@/shared/utils/logger';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    popTo: jest.fn(),
  }),
}));

const profile: Profile = {
  id: 'c55-account',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  contact_email: 'persona@example.test',
  nickname: null,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
};
const failure = {
  name: 'AuthApiError',
  code: 'invalid_credentials',
  status: 400,
  message: 'Invalid login credentials',
};
const insertConsent = jest.fn();
const upsertProfile = jest.fn();
const Ready: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return auth.status === 'authenticated' && auth.profileLoaded ? (
    <>{children}</>
  ) : null;
};

beforeEach(() => {
  i18n.locale = 'it';
  jest.clearAllMocks();
  logger.clearLogs();
  insertConsent.mockReset();
  upsertProfile.mockReset();
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: {
      session: { user: { id: profile.id, email: profile.contact_email } },
    },
    error: null,
  });
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'profiles')
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: profile, error: null }),
          }),
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
});

afterEach(() => logger.clearLogs());

// Controlli aggiuntivi dei due cancelli: form, provider e logger sono quelli reali.
it.each([
  {
    branch: 'CompletaProfilo',
    component: CompleteProfileScreen,
    sdk: upsertProfile,
    button: 'auth.completeProfile.submit',
  },
  {
    branch: 'RiConsenso',
    component: ReConsentScreen,
    sdk: insertConsent,
    button: 'auth.consents.reconsentAccept',
  },
])(
  'B3a: $branch registra codici anche dal cancello reale',
  async ({ branch, component: Screen, sdk, button }) => {
    for (const mode of ['resolved', 'rejected'] as const) {
      sdk.mockReset();
      if (mode === 'resolved') sdk.mockResolvedValueOnce({ error: failure });
      else sdk.mockRejectedValueOnce(failure);
      const ui = render(
        <AllProviders>
          <Ready>
            <Screen />
          </Ready>
        </AllProviders>
      );
      const submit = await ui.findByText(i18n.t(button));
      if (branch === 'CompletaProfilo')
        await ui.findByDisplayValue(profile.last_name);
      logger.clearLogs();
      fireEvent.press(submit);
      await waitFor(() => expect(sdk).toHaveBeenCalledTimes(1));
      expect(
        await ui.findByText(i18n.t('auth.errors.invalid_credentials'))
      ).toBeTruthy();
      expect(logger.getLogs()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            level: 'error',
            context: branch,
            data: {
              name: failure.name,
              code: failure.code,
              status: 400,
              chiave: 'invalid_credentials',
            },
          }),
        ])
      );
      ui.unmount();
    }
  }
);
