import { useCallback, useState } from 'react';

import {
  chiaveErroreAccount,
  registraErroreAccount,
} from '@/shared/auth/registraErroreAccount';
import { useTranslation } from '@/shared/hooks/useTranslation';

/** Messaggio e azione di recupero derivano dallo stesso mappatore. */
export const useAuthError = (
  fallback = 'auth.errors.generic',
  ramo = 'Account'
) => {
  const { t } = useTranslation();
  const [error, setMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const setError = useCallback((message: string | null | undefined): void => {
    setMessage(message ?? null);
    setErrorKey(null);
  }, []);
  const show = useCallback(
    (key: string): void => {
      setErrorKey(key);
      setMessage(t(key === 'generic' ? fallback : `auth.errors.${key}`));
    },
    [fallback, t]
  );
  // Per gli errori che NESSUNO ha ancora registrato (es. esportazione, uscita).
  const reportError = useCallback(
    (cause: unknown): void => show(registraErroreAccount(cause, ramo)),
    [ramo, show]
  );
  // Per gli errori che la fonte ha già registrato col suo ramo (registraEsitoAccount
  // e il rilancio di loadProfile): un'altra riga sarebbe un doppione nel rapporto.
  const showError = useCallback(
    (cause: unknown): void => show(chiaveErroreAccount(cause)),
    [show]
  );
  return {
    error,
    errorKey,
    setError,
    reportError,
    showError,
    offline: errorKey === 'network',
  };
};
