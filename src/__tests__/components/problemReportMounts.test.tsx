import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../helpers/testProviders';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import type { Profile } from '@/shared/auth/types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
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

const MAILTO = /^mailto:info@riseagainsthunger\.it\?subject=/;
const profile: Profile = {
  id: 'c55-mount',
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
const Ready: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return auth.status === 'authenticated' && auth.profileLoaded ? (
    <>{children}</>
  ) : null;
};
const signedIn = () =>
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: { user: { id: profile.id, email: 'a@example.test' } } },
    error: null,
  });
// `is_material: false` = informativa non cambiata: niente cancello di Ri-consenso
// davanti al Profilo (che ha anche lui «Esci dall'account»).
const tables = (readProfile: () => Promise<unknown>) =>
  (supabase.from as jest.Mock).mockImplementation((table: string) => ({
    select: () => ({
      eq: () => ({
        single:
          table === 'profiles'
            ? readProfile
            : () =>
                Promise.resolve({ data: { is_material: false }, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }));

/** Tocca il controllo vero e restituisce il corpo decodificato della mail aperta. */
const pressReport = async (ui: ReturnType<typeof render>): Promise<string> => {
  const button = await ui.findByRole('button', {
    name: i18n.t('support.reportProblem'),
  });
  fireEvent.press(button);
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledTimes(1));
  const url = jest.mocked(Linking.openURL).mock.calls[0]?.[0] ?? '';
  expect(url).toMatch(MAILTO);
  return decodeURIComponent(url.split('&body=')[1] ?? '');
};

beforeEach(() => {
  i18n.locale = 'it';
  jest.clearAllMocks();
  logger.clearLogs();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: null },
    error: null,
  });
  tables(() => Promise.resolve({ data: profile, error: null }));
});
afterEach(() => {
  jest.restoreAllMocks();
  logger.clearLogs();
});

// C55: l'ospite che apre il Profilo vede l'Accesso, e da lì la mail parte.
it("segnala un problema: dall'ospite", async () => {
  const ui = render(
    <AllProviders>
      <ProfileScreen />
    </AllProviders>
  );
  expect(await ui.findByText(i18n.t('auth.login.submit'))).toBeTruthy();
  expect(await pressReport(ui)).toContain(i18n.t('support.diagnostics'));
});

// C55 e C33: collegato, sia col profilo letto sia nello stato offline (rilettura
// fallita per rete, banner «Riprova» visibile): il controllo c'è in entrambi.
it('segnala un problema: da collegato', async () => {
  signedIn();
  const online = render(
    <AllProviders>
      <ProfileScreen />
    </AllProviders>
  );
  // Positivo: è il Profilo vero (l'esportazione esiste solo lì).
  expect(
    await online.findByText(i18n.t('auth.privacy.exportCta'))
  ).toBeTruthy();
  expect(await pressReport(online)).toContain(i18n.t('support.diagnostics'));
  online.unmount();

  jest.mocked(Linking.openURL).mockClear();
  logger.clearLogs();
  tables(() => Promise.reject(new TypeError('Network request failed')));
  const offline = render(
    <AllProviders>
      <ProfileScreen />
    </AllProviders>
  );
  expect(
    await offline.findByRole('button', { name: i18n.t('common.retry') })
  ).toBeTruthy();
  expect(offline.getByText(i18n.t('auth.privacy.exportCta'))).toBeTruthy();
  // La rilettura fallita è nel buffer e arriva nel corpo col suo ramo.
  const body = await pressReport(offline);
  expect(body).toContain('Profilo');
  expect(body).toContain('network');
});

// C55: i due cancelli del profilo (Completa profilo e Ri-consenso).
it('segnala un problema: dal cancello del profilo', async () => {
  signedIn();
  for (const Screen of [CompleteProfileScreen, ReConsentScreen]) {
    jest.mocked(Linking.openURL).mockClear();
    const ui = render(
      <AllProviders>
        <Ready>
          <Screen />
        </Ready>
      </AllProviders>
    );
    expect(await pressReport(ui)).toContain(i18n.t('support.diagnostics'));
    ui.unmount();
  }
});

class RenderTestError extends Error {
  override name = 'RenderTestError';
}
const Boom: React.FC = () => {
  throw new RenderTestError('render fallito');
};
const quiet = () => jest.spyOn(console, 'error').mockImplementation(() => {});

// C55: ErrorBoundary SENZA provider; il corpo porta il ramo e il nome dell'errore.
it("segnala un problema: dalla schermata d'errore", async () => {
  quiet();
  const ui = render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );
  const body = await pressReport(ui);
  expect(body).toContain('ErrorBoundary');
  expect(body).toContain('RenderTestError');
  expect(body).not.toContain('render fallito');
});

const luminance = (hex: string): number => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) throw new Error(`colore non esadecimale: ${hex}`);
  const value = parseInt(match[1], 16);
  const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};
type TestNode = ReturnType<
  ReturnType<typeof render>['UNSAFE_getAllByType']
>[number];
const background = (node: TestNode): string | undefined => {
  for (let n: TestNode | null = node; n; n = n.parent) {
    const color = StyleSheet.flatten(n.props.style)?.backgroundColor;
    if (typeof color === 'string') return color;
  }
  return undefined;
};

// C55: testo e pulsanti della schermata d'errore ≥ 4,5:1, letti dai colori
// renderizzati (sviluppo e produzione mostrano testi diversi).
it.each([true, false])(
  "B3b: schermata d'errore con contrasto ≥ 4,5:1 (__DEV__ %s)",
  dev => {
    quiet();
    const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
    const previous = runtime.__DEV__;
    runtime.__DEV__ = dev;
    try {
      const ui = render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      );
      const failures: string[] = [];
      let checked = 0;
      for (const node of ui.UNSAFE_getAllByType(Text)) {
        const color = StyleSheet.flatten(node.props.style)?.color;
        if (typeof color !== 'string') continue;
        checked += 1;
        const bg = background(node);
        const ratio = bg ? contrast(color, bg) : 0;
        if (ratio < 4.5)
          failures.push(
            `${color} su ${bg ?? '(nessuno)'}: ${ratio.toFixed(2)}`
          );
      }
      expect(failures).toEqual([]);
      // Positivo: titolo, messaggio, pulsante, supporto, segnalazione e versione.
      expect(checked).toBeGreaterThanOrEqual(6);
      expect(
        ui.getByText(new RegExp(`^${i18n.t('support.version')}: `))
      ).toBeTruthy();
    } finally {
      runtime.__DEV__ = previous;
    }
  }
);
