import React from 'react';
import { Alert, Linking, Platform, Share, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { SegnalaProblema } from '@/shared/components/SegnalaProblema';
import { minimumTouchTarget } from '@/shared/utils/minimumTouchTarget';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';
import { logger, logError } from '@/shared/utils/logger';
import { collectProblemReport } from '@/shared/utils/collectProblemReport';
import i18n from '@/locales';

const dimensions = { width: 360, height: 640, scale: 1, fontScale: 1 };
// Il modulo che `react-native` carica davvero: uno spy su `import * as` colpisce
// una copia e lascerebbe al componente la finestra del preset (750 × 1334).
const mockWindow = jest.fn();
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindow(),
}));
const mount = () =>
  render(
    <UniversalThemeProvider>
      <SegnalaProblema />
    </UniversalThemeProvider>
  );
const button = (ui: ReturnType<typeof mount>) =>
  ui.getByRole('button', { name: i18n.t('support.reportProblem') });
const diagnostic = () =>
  logError('privato', 'Accesso', {
    name: 'AuthApiError',
    code: 'invalid_credentials',
    status: 400,
    chiave: 'invalid_credentials',
  });

beforeEach(() => {
  // `Linking.openURL` è già un mock del preset: spyOn restituisce lo stesso e
  // restoreAllMocks non ne azzera le chiamate fra un test e l'altro.
  jest.clearAllMocks();
  i18n.locale = 'it';
  logger.clearLogs();
  mockWindow.mockReturnValue(dimensions);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
});
afterEach(() => {
  jest.restoreAllMocks();
  logger.clearLogs();
  i18n.locale = 'it';
});

// C55: hook reale fino a Linking; diagnosi aggiunta DOPO il render e mantenuta
// quando il client di posta rigetta. Positivo: apertura e Share ricevono il corpo.
it("segnala un problema: rifiuto mostra l'indirizzo e Condividi", async () => {
  for (const locale of ['it', 'en']) {
    i18n.locale = locale;
    jest
      .mocked(Linking.openURL)
      .mockRejectedValueOnce(new Error('No mail app'));
    const ui = mount();
    expect(
      ui.queryByRole('button', { name: i18n.t('support.shareText') })
    ).toBeNull();
    diagnostic();
    const report = collectProblemReport(dimensions);
    fireEvent.press(button(ui));
    const share = await ui.findByRole('button', {
      name: i18n.t('support.shareText'),
    });
    expect(
      ui.getByText(
        i18n.t('links.errors.email', { email: 'info@riseagainsthunger.it' })
      )
    ).toBeTruthy();
    expect(Alert.alert).toHaveBeenLastCalledWith(
      i18n.t('common.error'),
      i18n.t('links.errors.email', { email: 'info@riseagainsthunger.it' })
    );
    expect(Linking.openURL).toHaveBeenLastCalledWith(
      expect.stringMatching(/^mailto:info@riseagainsthunger\.it\?subject=/)
    );
    logger.clearLogs();
    await act(async () => {
      fireEvent.press(share);
      await Promise.resolve();
    });
    expect(Share.share).toHaveBeenLastCalledWith({ message: report.body });
    expect(report.body).toContain('invalid_credentials');
    ui.unmount();
  }
});

// C43/C55: due finestre contrattuali, rotazione e dimensione maggiore; controllo
// lo stile del controllo reale oltre alla funzione pura, senza scalarlo di nuovo.
it('segnala un problema: area toccabile ≥ 48 dp', () => {
  expect(minimumTouchTarget(20)).toEqual({ minWidth: 48, minHeight: 48 });
  expect(minimumTouchTarget(64)).toEqual({ minWidth: 64, minHeight: 64 });
  expect(minimumTouchTarget(Number.NaN)).toEqual({
    minWidth: 48,
    minHeight: 48,
  });
  for (const [width, height] of [
    [360, 640],
    [320, 568],
    [640, 360],
    [800, 1280],
  ] as const) {
    mockWindow.mockReturnValue({ ...dimensions, width, height });
    const ui = mount();
    const style = StyleSheet.flatten(button(ui).props.style);
    expect(style.minWidth).toBeGreaterThanOrEqual(48);
    expect(style.minHeight).toBeGreaterThanOrEqual(48);
    ui.unmount();
  }
});

it('B3b: metadati oltre 2000 caratteri restano condivisibili senza lanciare', async () => {
  const previous = Constants.expoConfig;
  Constants.expoConfig = {
    ...previous,
    name: 'Rise',
    slug: 'rise',
    version: 'v'.repeat(2400),
  };
  try {
    const ui = mount();
    diagnostic();
    const report = collectProblemReport(dimensions);
    await act(async () => {
      fireEvent.press(button(ui));
      await Promise.resolve();
    });
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(
      ui.getByText(
        i18n.t('links.errors.email', { email: 'info@riseagainsthunger.it' })
      )
    ).toBeTruthy();
    await act(async () => {
      fireEvent.press(
        ui.getByRole('button', { name: i18n.t('support.shareText') })
      );
      await Promise.resolve();
    });
    expect(Share.share).toHaveBeenCalledWith({ message: report.body });
    expect(report.body).toContain('invalid_credentials');
  } finally {
    Constants.expoConfig = previous;
  }
});

it('B3b: doppio tocco apre una sola mail e il successo non offre Condividi', async () => {
  let finish: (() => void) | undefined;
  jest.mocked(Linking.openURL).mockImplementation(
    () =>
      new Promise<void>(resolve => {
        finish = resolve;
      })
  );
  const ui = mount();
  diagnostic();
  await act(async () => {
    fireEvent.press(button(ui));
    fireEvent.press(button(ui));
    await Promise.resolve();
  });
  expect(Linking.openURL).toHaveBeenCalledTimes(1);
  expect(button(ui).props.accessibilityState).toMatchObject({
    busy: true,
    disabled: true,
  });
  expect(
    ui.queryByRole('button', { name: i18n.t('support.shareText') })
  ).toBeNull();
  await act(async () => {
    finish?.();
    await Promise.resolve();
  });
  await waitFor(() =>
    expect(button(ui).props.accessibilityState.busy).toBe(false)
  );
  const url = jest.mocked(Linking.openURL).mock.calls[0]?.[0] ?? '';
  expect(decodeURIComponent(url.split('&body=')[1] ?? '')).toContain(
    'invalid_credentials'
  );
  expect(url.length).toBeLessThanOrEqual(2000);
  expect(Share.share).not.toHaveBeenCalled();
});

it('B3b: il rifiuto di Condividi è visibile e il testo può essere ritentato', async () => {
  jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error('No mail app'));
  jest
    .mocked(Share.share)
    .mockRejectedValueOnce(new Error('Share unavailable'));
  const ui = mount();
  diagnostic();
  fireEvent.press(button(ui));
  const share = await ui.findByRole('button', {
    name: i18n.t('support.shareText'),
  });
  await act(async () => {
    fireEvent.press(share);
    await Promise.resolve();
  });
  expect(ui.getByText(i18n.t('support.shareError'))).toBeTruthy();
  await act(async () => {
    fireEvent.press(share);
    await Promise.resolve();
  });
  expect(Share.share).toHaveBeenCalledTimes(2);
  const shared = jest.mocked(Share.share).mock.calls;
  expect(shared[1]?.[0]).toEqual(shared[0]?.[0]);
  expect(shared[0]?.[0]).toEqual({
    message: expect.stringContaining('invalid_credentials'),
  });
  expect(ui.queryByText(i18n.t('support.shareError'))).toBeNull();
});

// Su Android due tocchi rapidi aprirebbero due selettori di app sovrapposti.
it('B3b: doppio tocco su Condividi apre un solo selettore', async () => {
  jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error('No mail app'));
  let finish: (() => void) | undefined;
  jest.mocked(Share.share).mockImplementation(
    () =>
      new Promise(resolve => {
        finish = () => resolve({ action: Share.sharedAction });
      })
  );
  const ui = mount();
  diagnostic();
  fireEvent.press(button(ui));
  const share = await ui.findByRole('button', {
    name: i18n.t('support.shareText'),
  });
  await act(async () => {
    fireEvent.press(share);
    fireEvent.press(share);
    await Promise.resolve();
  });
  expect(Share.share).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish?.();
    await Promise.resolve();
  });
  await waitFor(() =>
    expect(
      ui.getByRole('button', { name: i18n.t('support.shareText') }).props
        .accessibilityState.busy
    ).toBe(false)
  );
});

// Diagnosi illeggibile (su web `Platform.constants` manca e `in` lancia): il
// pulsante non resta bloccato, l'indirizzo compare, Condividi no (niente testo).
it("B3b: diagnosi illeggibile lascia il pulsante usabile e mostra l'indirizzo", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, 'constants');
  Object.defineProperty(Platform, 'constants', {
    configurable: true,
    get: () => undefined,
  });
  try {
    const ui = mount();
    await act(async () => {
      fireEvent.press(button(ui));
      await Promise.resolve();
    });
    expect(
      await ui.findByText(
        i18n.t('links.errors.email', { email: 'info@riseagainsthunger.it' })
      )
    ).toBeTruthy();
    expect(button(ui).props.accessibilityState).toMatchObject({
      busy: false,
      disabled: false,
    });
    expect(
      ui.queryByRole('button', { name: i18n.t('support.shareText') })
    ).toBeNull();
    expect(Linking.openURL).not.toHaveBeenCalled();
  } finally {
    if (descriptor) Object.defineProperty(Platform, 'constants', descriptor);
  }
});
