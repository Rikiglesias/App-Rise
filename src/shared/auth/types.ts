/** Tipi dominio auth/profilo donatore (Milestone 1). */

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  province: string;
  birth_date: string; // ISO date (YYYY-MM-DD)
  privacy_consent_at: string; // ISO timestamp
  marketing_consent: boolean;
  deletion_requested_at: string | null; // M3: NULL=attivo; valorizzato=cancellazione a +30gg
}

/** Dati raccolti dal form di registrazione (prima della scrittura su DB). */
export interface ProfileInput {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  province: string;
  birth_date: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
}
