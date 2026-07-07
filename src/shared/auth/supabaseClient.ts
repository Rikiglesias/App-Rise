import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { authStorage } from './authStorage';
import { env } from '@/shared/config/environment';

/**
 * Client Supabase per l'app donatori.
 * - Sessione persistita cifrata via authStorage (SecureStore chunking).
 * - autoRefreshToken gestito da AppState (refresh solo in foreground).
 * - anon key pubblica per design: la sicurezza dati sta nelle RLS policy.
 */
// Fallback placeholder se .env non è configurato: evita il crash di createClient
// (richiede un URL valido) in dev/test pre-credenziali. Le chiamate falliranno con
// errore di rete finché non si impostano le vere credenziali Supabase.
const supabaseUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

// Il fetch di React Native non ha timeout: una rete che apre la connessione ma poi
// stalla (metro, ascensore, captive portal) lascia le chiamate auth/PostgREST
// pendenti all'infinito → lo spinner del login gira per sempre e il bottone resta
// disabilitato, senza modo di annullare. Un AbortController a 15s le fa fallire con
// un errore di rete gestibile. Se la chiamata porta già un proprio signal (alcune
// operazioni Supabase lo passano) lo rispettiamo, per non annullarne l'abort nativo.
const TIMEOUT_MS = 15000;
const fetchWithTimeout: typeof fetch = (input, init) => {
  if (init?.signal) return fetch(input, init);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetchWithTimeout },
});

AppState.addEventListener('change', state => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
