import { supabase } from './supabaseClient';
import {
  isRecoveryRedirect,
  isEmailConfirmRedirect,
  parseAuthRedirect,
} from './authRedirect';

/** Lo storage del client conserva il verificatore PKCE anche al riavvio dell'app. */
export const exchangeAuthLink = async (
  url: string,
  expected: 'reset' | 'confirm'
): Promise<{ ok: boolean }> => {
  const accepted =
    expected === 'reset'
      ? isRecoveryRedirect(url)
      : isEmailConfirmRedirect(url);
  const { code } = parseAuthRedirect(url);
  if (!accepted || !code) return { ok: false };
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    return { ok: !error && Boolean(data.session) };
  } catch {
    // Anche storage/rete possono rigettare: il chiamante mostra l'esito tradotto.
    return { ok: false };
  }
};
