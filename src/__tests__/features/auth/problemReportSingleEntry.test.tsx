import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import { logger } from '@/shared/utils/logger';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
  }),
}));

// Il banner «annulla eliminazione» esiste solo con la cancellazione differita
// accesa: getter come in deleteAccount.test.tsx, spento salvo dove serve.
let mockCancellazioneProgrammataAttiva = false;
jest.mock('@/shared/auth/deletionPolicy', () => {
  const reale = jest.requireActual('@/shared/auth/deletionPolicy');
  return {
    __esModule: true,
    GRACE_DAYS: reale.GRACE_DAYS,
    get CANCELLAZIONE_PROGRAMMATA_ATTIVA() {
      return mockCancellazioneProgrammataAttiva;
    },
  };
});

const failure = {
  name: 'AuthApiError',
  code: 'invalid_credentials',
  status: 400,
  message: 'Invalid login credentials',
};
const readConsent = jest.fn();
const Ready: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return auth.status === 'authenticated' && auth.profileLoaded ? (
    <>{children}</>
  ) : null;
};

beforeEach(() => {
  i18n.locale = 'it';
  mockCancellazioneProgrammataAttiva = false;
  jest.clearAllMocks();
  logger.clearLogs();
  readConsent.mockReset().mockResolvedValue({ data: [], error: null });
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: null },
    error: null,
  });
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'profiles')
      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      };
    if (table === 'consent_events')
      return { select: () => ({ eq: () => ({ order: readConsent }) }) };
    return {
      select: () => ({
        eq: () => ({
          // Informativa non cambiata: senza `is_material` il fail-safe aprirebbe
          // il cancello di Ri-consenso, che ha anch'esso «Esci dall'account».
          single: () =>
            Promise.resolve({ data: { is_material: false }, error: null }),
        }),
      }),
    };
  });
});

afterEach(() => logger.clearLogs());

const errors = () => logger.getLogs().filter(entry => entry.level === 'error');

// L'accesso e il logger sono reali: soltanto la risposta SDK viene controllata.
it('B3b: accesso fallito registra una sola voce error dal ramo vero', async () => {
  for (const mode of ['resolved', 'rejected'] as const) {
    const sdk = supabase.auth.signInWithPassword as jest.Mock;
    sdk.mockReset();
    if (mode === 'resolved') sdk.mockResolvedValueOnce({ error: failure });
    else sdk.mockRejectedValueOnce(failure);
    const ui = render(<LoginScreen />, { wrapper: AllProviders });
    fireEvent.changeText(
      ui.getByLabelText(i18n.t('auth.login.email')),
      'a@example.test'
    );
    fireEvent.changeText(
      ui.getByLabelText(i18n.t('auth.login.password')),
      'Password1!'
    );
    logger.clearLogs();
    fireEvent.press(ui.getByText(i18n.t('auth.login.submit')));
    expect(
      await ui.findByText(i18n.t('auth.errors.invalid_credentials'))
    ).toBeTruthy();
    expect(sdk).toHaveBeenCalledTimes(1);
    expect(errors()).toEqual([
      expect.objectContaining({
        level: 'error',
        context: 'Accesso',
        data: {
          name: failure.name,
          code: failure.code,
          status: 400,
          chiave: 'invalid_credentials',
        },
      }),
    ]);
    ui.unmount();
  }
});

// Il controllo positivo del successo esegue comunque la chiamata SDK.
it('B3b: accesso riuscito non aggiunge errori', async () => {
  const sdk = supabase.auth.signInWithPassword as jest.Mock;
  sdk.mockReset().mockResolvedValueOnce({ error: null });
  const ui = render(<LoginScreen />, { wrapper: AllProviders });
  fireEvent.changeText(
    ui.getByLabelText(i18n.t('auth.login.email')),
    'a@example.test'
  );
  fireEvent.changeText(
    ui.getByLabelText(i18n.t('auth.login.password')),
    'Password1!'
  );
  logger.clearLogs();
  fireEvent.press(ui.getByText(i18n.t('auth.login.submit')));
  await waitFor(() => expect(sdk).toHaveBeenCalledTimes(1));
  expect(errors()).toEqual([]);
});

// Questi errori non vengono registrati dalla fonte: la UI deve conservarli.
it.each(['export', 'logout'] as const)(
  'B3b: conserva la registrazione UI di %s',
  async action => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: { user: { id: 'c55-single', email: 'a@example.test' } },
      },
      error: null,
    });
    const sdk =
      action === 'export' ? readConsent : (supabase.auth.signOut as jest.Mock);
    const ui = render(
      <AllProviders>
        <Ready>
          <ProfileScreen />
        </Ready>
      </AllProviders>
    );
    // Positivo: è il Profilo, non un cancello (l'esportazione esiste solo qui).
    expect(await ui.findByText(i18n.t('auth.privacy.exportCta'))).toBeTruthy();
    const button = await ui.findByText(
      i18n.t(
        action === 'export' ? 'auth.privacy.exportCta' : 'auth.profile.logout'
      )
    );
    sdk.mockReset().mockRejectedValueOnce(failure);
    logger.clearLogs();
    fireEvent.press(button);
    expect(
      await ui.findByText(i18n.t('auth.errors.invalid_credentials'))
    ).toBeTruthy();
    expect(sdk).toHaveBeenCalledTimes(1);
    expect(errors()).toHaveLength(1);
    expect(errors()[0]).toEqual(
      expect.objectContaining({
        level: 'error',
        data: expect.objectContaining({ code: failure.code }),
      })
    );
  }
);

// Annullamento e consenso rigettano solo dal rilancio di loadProfile, che registra
// già col ramo «Profilo»: la schermata mostra l'errore senza aggiungere una riga.
it.each(['cancel', 'consent'] as const)(
  'B3b: %s con rilettura del profilo fallita registra una sola voce',
  async action => {
    mockCancellazioneProgrammataAttiva = action === 'cancel';
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: { user: { id: 'c55-single', email: 'a@example.test' } },
      },
      error: null,
    });
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'c55-single',
        marketing_consent: false,
        deletion_requested_at: new Date().toISOString(),
      },
      error: null,
    });
    const update = jest.fn(() => ({
      eq: () => Promise.resolve({ error: null }),
    }));
    const insert = jest.fn(() => Promise.resolve({ error: null }));
    const base = (supabase.from as jest.Mock).getMockImplementation();
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'profiles')
        return { select: () => ({ eq: () => ({ single }) }), update };
      if (table === 'consent_events')
        return {
          select: () => ({ eq: () => ({ order: readConsent }) }),
          insert,
        };
      return base?.(table);
    });
    const ui = render(
      <AllProviders>
        <Ready>
          <ProfileScreen />
        </Ready>
      </AllProviders>
    );
    expect(await ui.findByText(i18n.t('auth.privacy.exportCta'))).toBeTruthy();
    single.mockResolvedValueOnce({ data: null, error: failure });
    logger.clearLogs();
    if (action === 'cancel')
      fireEvent.press(await ui.findByText(i18n.t('auth.delete.bannerCancel')));
    else
      fireEvent(
        ui.getByLabelText(i18n.t('auth.consents.marketing')),
        'valueChange',
        true
      );
    // Due testi: l'errore del profilo in testa e quello dell'azione. Si aspetta
    // il secondo, cioè che il ramo della schermata abbia già girato.
    const message = i18n.t('auth.errors.invalid_credentials');
    await waitFor(() => expect(ui.getAllByText(message)).toHaveLength(2));
    expect(action === 'cancel' ? update : insert).toHaveBeenCalledTimes(1);
    expect(errors()).toEqual([
      expect.objectContaining({
        level: 'error',
        context: 'Profilo',
        data: expect.objectContaining({ code: failure.code }),
      }),
    ]);
  }
);
