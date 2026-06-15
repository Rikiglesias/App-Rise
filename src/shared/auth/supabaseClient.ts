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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
