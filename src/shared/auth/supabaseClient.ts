import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { authStorage } from './authStorage';
import { env } from '@/shared/config/environment';
import { fetchWithTimeout } from '@/shared/utils/fetchWithTimeout';

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

/**
 * Chiave con cui la sessione sta nello storage. È IDENTICA al default di supabase-js
 * (`SupabaseClient` 2.x: `sb-${baseUrl.hostname.split('.')[0]}-auth-token`), così
 * nessuno che ha già fatto l'accesso viene disconnesso; dichiararla serve a poter
 * togliere la sessione quando la libreria non lo fa (vedi `deleteAccountNow`), senza
 * dipendere da un dettaglio interno della libreria.
 */
export const SESSION_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
  auth: {
    flowType: 'pkce',
    storage: authStorage,
    storageKey: SESSION_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** Toglie la sessione dallo storage dell'app, per quando la libreria non lo fa. */
export const rimuoviSessioneSalvata = (): Promise<void> =>
  authStorage.removeItem(SESSION_STORAGE_KEY);

AppState.addEventListener('change', state => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
