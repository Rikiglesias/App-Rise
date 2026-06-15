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
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
