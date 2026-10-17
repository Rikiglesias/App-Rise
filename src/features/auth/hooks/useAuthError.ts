import { useCallback, useState } from 'react';

import { mapAuthError } from '@/shared/auth/authErrors';
import { useTranslation } from '@/shared/hooks/useTranslation';

/** Messaggio e azione di recupero derivano dallo stesso mappatore. */
export const useAuthError = (fallback = 'auth.errors.generic') => {
  const { t } = useTranslation();
  const [error, setMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const setError = useCallback((message: string | null | undefined): void => {
    setMessage(message ?? null);
    setErrorKey(null);
  }, []);
  const reportError = useCallback(
    (cause: unknown): void => {
      const key = mapAuthError(cause);
      setErrorKey(key);
      setMessage(t(key === 'generic' ? fallback : `auth.errors.${key}`));
    },
    [fallback, t]
  );
  return {
    error,
    errorKey,
    setError,
    reportError,
    offline: errorKey === 'network',
  };
};
