/** Tipi dominio auth/profilo donatore (Milestone 1). */

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  // Profilo MINIMO alla nascita (decisione D-a, migration 0010): phone e city possono
  // mancare alla creazione e si completano dopo. `null` = mai valorizzato, non «vuoto».
  // NB: nullable ≠ opzionale per sempre — il completamento è obbligatorio, lo governa
  // `profileCompletion.ts`.
  phone: string | null;
  city: string | null;
  // Sigla provincia IT. NULL per i paesi esteri: è il trigger a scriverlo così
  // (`nullif(province,'')`, migration 0007), quindi il tipo dice `null`, non `''`.
  province: string | null;
  country: string; // ISO 3166-1 alpha-2 (es. 'IT') — NOT NULL con default dal trigger
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
  'first_name' | 'last_name' | 'country' | 'birth_date'
> & {
  /**
   * Come `contact_email`: sul path di RETTIFICA sono sempre stringhe, anche se in
   * `Profile` possono essere null (profilo minimo, migration 0010). Chi corregge i
   * propri dati li valorizza — la schermata di modifica non ha un modo per rimetterli
   * a null, e il completamento differito passa da qui scrivendo un valore.
   */
  phone: string;
  city: string;
  /** Sigla IT; stringa vuota per i paesi esteri (la schermata azzera così). */
  province: string;
  /**
   * F1.10: email di contatto, rettificabile dagli utenti Apple Private Relay.
   * Sul path di rettifica è sempre una stringa (a differenza di `Profile`, dove
   * può essere null): l'utente la valorizza, non la svuota — per "azzerarla"
   * vale la regola di fallback `contact_email ?? auth.email`.
   */
  contact_email: string;
};

/** Whitelist dei campi aggiornabili: previene update di id/created_at/consensi. */
export const PROFILE_EDITABLE_KEYS: readonly (keyof ProfileEditable)[] = [
  'first_name',
  'last_name',
  'phone',
  'city',
  'province',
  'country',
  'birth_date',
  'contact_email',
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
