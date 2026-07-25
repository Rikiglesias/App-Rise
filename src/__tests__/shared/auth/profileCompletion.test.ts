import {
  missingProfileFields,
  getProfileCompletion,
} from '@/shared/auth/profileCompletion';
import type { Profile } from '@/shared/auth/types';

const base: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Bologna',
  province: 'BO',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-07-01T10:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
  // Un profilo «pieno» oggi include la mail di contatto: è il campo su cui poggia
  // il riconoscimento nell'anagrafica importata dal partner.
  contact_email: 'vera@mail.it',
};

describe('missingProfileFields', () => {
  it('profilo pieno: niente da chiedere', () => {
    expect(missingProfileFields(base)).toEqual([]);
  });

  it('elenca i campi mai valorizzati (profilo minimo)', () => {
    expect(
      missingProfileFields({ ...base, phone: null, city: null, province: null })
    ).toEqual(['phone', 'city', 'province']);
  });

  it('chiede la mail di contatto quando manca (registrazione email/password)', () => {
    // Chi si registra con email e password crea un profilo con la colonna vuota:
    // senza questo campo nell'elenco, quel profilo risultava «completo» e il
    // sollecito taceva proprio sul dato reso obbligatorio.
    expect(missingProfileFields({ ...base, contact_email: null })).toEqual([
      'contact_email',
    ]);
    expect(missingProfileFields({ ...base, contact_email: '  ' })).toEqual([
      'contact_email',
    ]);
  });

  it('tratta la stringa di soli spazi come mancante', () => {
    // Un dato scritto per sbaglio come '   ' non è un dato: senza il trim il
    // sollecito non partirebbe e il campo resterebbe vuoto per sempre.
    expect(missingProfileFields({ ...base, phone: '   ' })).toEqual(['phone']);
  });

  it('NON chiede la provincia per un paese estero', () => {
    // Per l'estero il trigger scrive null per costruzione (migration 0007):
    // pretenderla sarebbe un sollecito impossibile da soddisfare.
    expect(
      missingProfileFields({ ...base, country: 'FR', province: null })
    ).toEqual([]);
  });

  it('chiede la provincia se il paese è IT e manca', () => {
    expect(missingProfileFields({ ...base, province: null })).toEqual([
      'province',
    ]);
  });

  it('senza profilo non chiede nulla (non è un profilo incompleto)', () => {
    expect(missingProfileFields(null)).toEqual([]);
    expect(missingProfileFields(undefined)).toEqual([]);
  });
});

describe('getProfileCompletion', () => {
  it('profilo non ancora caricato = unknown, mai «incompleto»', () => {
    // È il caso che evita il sollecito fantasma all'avvio dell'app a chi ha il
    // profilo a posto: `null` mentre carica non significa «manca».
    expect(getProfileCompletion(null, false)).toBe('unknown');
    expect(getProfileCompletion(base, false)).toBe('unknown');
  });

  it('caricato e assente = absent (profilo che non esiste, non incompleto)', () => {
    expect(getProfileCompletion(null, true)).toBe('absent');
  });

  it('caricato con campi mancanti = incomplete', () => {
    expect(getProfileCompletion({ ...base, phone: null }, true)).toBe(
      'incomplete'
    );
  });

  it('caricato e pieno = complete', () => {
    expect(getProfileCompletion(base, true)).toBe('complete');
  });
});
