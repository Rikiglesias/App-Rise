import { logError } from './logger';

const NETWORK_TIMEOUT_MS = 15_000;

/** Solo la famiglia dell'endpoint: host, percorso restante e query non entrano nei log. */
const endpointFamily = (input: Parameters<typeof fetch>[0]): string => {
  try {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return (
      new URL(url).pathname.match(
        /^\/(auth|rest|functions|storage)\/v1(?:\/|$)/
      )?.[1] ?? '-'
    );
  } catch {
    return '-';
  }
};

const aborted = (): Error => {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

/** Limita ogni richiesta e conserva la cancellazione del chiamante, anche da Request. */
export const fetchWithTimeout: typeof fetch = async (input, init) => {
  const callerSignal =
    init?.signal !== undefined
      ? init.signal
      : typeof input === 'object' && 'signal' in input
        ? input.signal
        : undefined;
  if (callerSignal?.aborted) throw callerSignal.reason ?? aborted();

  const controller = new AbortController();
  let cancelRequest: (reason: unknown) => void = () => undefined;
  const cancellation = new Promise<never>((_, reject) => {
    cancelRequest = reject;
  });
  const onAbort = (): void => {
    cancelRequest(callerSignal?.reason ?? aborted());
    controller.abort();
  };
  const timer = setTimeout(() => {
    logError('timeout', 'rete', {
      name: 'AbortError',
      code: endpointFamily(input),
    });
    cancelRequest(aborted());
    controller.abort();
  }, NETWORK_TIMEOUT_MS);
  callerSignal?.addEventListener('abort', onAbort, { once: true });
  try {
    // La race chiude anche se il trasporto nativo non consegna il rifiuto di abort.
    return await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      cancellation,
    ]);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onAbort);
  }
};
