/** Tipi dominio auth/profilo donatore (Milestone 1). */

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  province: string; // sigla provincia IT; vuota per paesi esteri
  country: string; // ISO 3166-1 alpha-2 (es. 'IT')
  birth_date: string; // ISO date (YYYY-MM-DD)
  privacy_consent_at: string; // ISO timestamp
  marketing_consent: boolean;
  deletion_requested_at: string | null; // M3: NULL=attivo; valorizzato=cancellazione a +30gg
  // Email di contatto scelta dall'utente (migration 0009), distinta da auth.email
  // (che con Apple può essere un Private Relay). Usata per il prefill dei form
  // partner: regola contact_email ?? auth.email. NULL finché non valorizzata.
  contact_email: string | null;
}

/** Consensi (M4, GDPR Art.7) — registro append-only. */
export type ConsentPurpose = 'privacy_notice' | 'marketing' | 'profiling';
export type ConsentAction = 'granted' | 'withdrawn';

export interface ConsentEvent {
  id: string;
  user_id: string;
  purpose: ConsentPurpose;
  action: ConsentAction;
  policy_version: string;
  legal_basis: string; // 'consent' | 'contract'
  channel: string;
  created_at: string; // ISO timestamp
}

/** Campi del profilo correggibili dall'utente in-app (M5, GDPR Art.16 rettifica). */
export type ProfileEditable = Pick<
  Profile,
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'city'
  | 'province'
  | 'country'
  | 'birth_date'
>;

/** Whitelist dei campi aggiornabili: previene update di id/created_at/consensi. */
export const PROFILE_EDITABLE_KEYS: readonly (keyof ProfileEditable)[] = [
  'first_name',
  'last_name',
  'phone',
  'city',
  'province',
  'country',
  'birth_date',
];

/** Dati raccolti dal form di registrazione (prima della scrittura su DB). */
export interface ProfileInput {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  birth_date: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
}
