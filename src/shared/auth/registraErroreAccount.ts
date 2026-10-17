import { mapAuthError } from './authErrors';
import it from '@/locales/it';
import { sanitizeProblemError } from '@/shared/utils/buildProblemReport';
import { logError } from '@/shared/utils/logger';

/** Registra solo codici consentiti e restituisce la chiave usata dalla UI. */
export const registraErroreAccount = (error: unknown, ramo: string): string => {
  const chiave = mapAuthError(error);
  const details = typeof error === 'object' && error !== null ? error : {};
  const data = sanitizeProblemError(
    {
      name: 'name' in details ? details.name : undefined,
      code: 'code' in details ? details.code : undefined,
      status: 'status' in details ? details.status : undefined,
      chiave,
    },
    Object.keys(it.auth.errors)
  );
  logError(
    'account',
    ramo === ramo.trim() && /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(ramo)
      ? ramo
      : '-',
    data
  );
  return chiave;
};

/** Intercetta risposta e rigetto prima che i metodi pubblici riducano l'errore a testo. */
export const registraEsitoAccount = async <T extends { error?: unknown }>(
  ramo: string,
  operation: () => PromiseLike<T>
): Promise<T> => {
  let result: T;
  try {
    result = await operation();
  } catch (error) {
    registraErroreAccount(error, ramo);
    throw error;
  }
  if (result.error) registraErroreAccount(result.error, ramo);
  return result;
};
