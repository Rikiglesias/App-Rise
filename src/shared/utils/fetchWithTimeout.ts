const NETWORK_TIMEOUT_MS = 15_000;

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
