import React from 'react';
import { render } from '@testing-library/react-native';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { fetchWithTimeout } from '@/shared/utils/fetchWithTimeout';
import { logger } from '@/shared/utils/logger';

const originalFetch = global.fetch;
const transport = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

beforeEach(() => {
  logger.clearLogs();
  global.fetch = transport;
  transport.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  logger.clearLogs();
});

// C55: ciascun servizio viene riconosciuto dal percorso, senza conservare l'URL.
// Il trasporto sospeso non registra nulla: il timeout reale produce la diagnosi.
it('segnala un problema: timeout di rete nel buffer', async () => {
  jest.useFakeTimers();
  transport.mockImplementation(() => new Promise(() => undefined));
  const services = ['auth', 'rest', 'functions', 'storage'] as const;
  const urls = services.map(
    service =>
      `https://example.invalid/${service}/v1/secret?access_token=segreto`
  );
  const requests = urls.map((url, index) => {
    const input =
      index === 1 ? new URL(url) : index === 2 ? new Request(url) : url;
    return fetchWithTimeout(input).catch((error: unknown) => error);
  });

  await jest.advanceTimersByTimeAsync(14999);
  expect(logger.getLogs()).toEqual([]);
  await jest.advanceTimersByTimeAsync(1);
  const results = await Promise.all(requests);
  expect(transport).toHaveBeenCalledTimes(4);
  results.forEach(error =>
    expect(error).toEqual(expect.objectContaining({ name: 'AbortError' }))
  );
  expect(logger.getLogs()).toEqual(
    services.map(code =>
      expect.objectContaining({
        level: 'error',
        message: 'timeout',
        context: 'rete',
        data: { name: 'AbortError', code },
      })
    )
  );
  const serialized = JSON.stringify(logger.getLogs());
  expect(serialized).not.toMatch(/example\.invalid|access_token|segreto/);
  expect(jest.getTimerCount()).toBe(0);
});

it('B3a: risposta riuscita e annullamento manuale non registrano timeout', async () => {
  jest.useFakeTimers();
  const response = { ok: true } as Response;
  transport.mockResolvedValueOnce(response);
  await expect(
    fetchWithTimeout('https://example.invalid/auth/v1/token')
  ).resolves.toBe(response);
  await jest.advanceTimersByTimeAsync(15000);
  expect(logger.getLogs()).toEqual([]);

  transport.mockImplementation(() => new Promise(() => undefined));
  const controller = new AbortController();
  const pending = fetchWithTimeout('https://example.invalid/rest/v1/profiles', {
    signal: controller.signal,
  });
  const assertion = expect(pending).rejects.toEqual(
    expect.objectContaining({ name: 'AbortError' })
  );
  controller.abort();
  await assertion;
  await jest.advanceTimersByTimeAsync(15000);
  expect(transport).toHaveBeenCalledTimes(2);
  expect(logger.getLogs()).toEqual([]);
  expect(jest.getTimerCount()).toBe(0);
});

const Failure = (): React.ReactElement => {
  throw new TypeError('Errore privato non necessario alla diagnosi');
};

it('B3a: ErrorBoundary registra il nome nel buffer senza provider', () => {
  const ui = render(
    <ErrorBoundary>
      <Failure />
    </ErrorBoundary>
  );
  expect(logger.getLogs()).toEqual([
    expect.objectContaining({
      level: 'error',
      context: 'ErrorBoundary',
      data: expect.objectContaining({ name: 'TypeError' }),
    }),
  ]);
  ui.unmount();
});
