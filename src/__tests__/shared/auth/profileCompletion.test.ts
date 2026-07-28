import {
  missingProfileFields,
  getProfileCompletion,
  isProfileGateBlocked,
  PROFILE_FIELD_LABELS,
} from '@/shared/auth/profileCompletion';
import it_ from '@/locales/it';
import en from '@/locales/en';
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

describe('PROFILE_FIELD_LABELS — ogni campo mancante ha un nome leggibile', () => {
  it('copre TUTTI i campi che il cancello può pretendere', () => {
    // Il messaggio «manca ancora …» compare SOLO quando la validazione del form non ha
    // segnalato nulla: lì la persona non vede campi in rosso e l'elenco è la sua unica
    // indicazione. Un campo aggiunto a `CompletableField` senza etichetta la
    // lascerebbe davanti a una richiesta muta — questo test lo impedisce.
    const everyField = missingProfileFields({
      phone: null,
      city: null,
      province: null,
      country: 'IT',
      contact_email: null,
    });
    expect(everyField).toEqual(['phone', 'city', 'province', 'contact_email']);
    everyField.forEach(field => {
      expect(PROFILE_FIELD_LABELS[field]).toBeTruthy();
    });
  });

  it('usa le etichette del form, non stringhe nuove', () => {
    // La persona deve rileggere la stessa parola che ha davanti nel campo.
    expect(PROFILE_FIELD_LABELS.phone).toBe('auth.signup.phone');
    expect(PROFILE_FIELD_LABELS.city).toBe('auth.signup.city');
    expect(PROFILE_FIELD_LABELS.province).toBe('auth.signup.province');
    expect(PROFILE_FIELD_LABELS.contact_email).toBe(
      'auth.completeProfile.contactEmail'
    );
  });

  it('le chiavi esistono davvero nelle traduzioni, in italiano e in inglese', () => {
    // Un'etichetta che punta a una chiave inesistente stamperebbe la chiave grezza
    // dentro il messaggio: peggio del messaggio generico che stiamo sostituendo.
    const read = (dict: Record<string, unknown>, path: string): unknown =>
      path
        .split('.')
        .reduce<unknown>(
          (node, key) => (node as Record<string, unknown>)?.[key],
          dict
        );
    Object.values(PROFILE_FIELD_LABELS).forEach(key => {
      expect(typeof read(it_ as Record<string, unknown>, key)).toBe('string');
      expect(typeof read(en as Record<string, unknown>, key)).toBe('string');
    });
  });
});

describe('isProfileGateBlocked — quando il cancello sbarra la strada', () => {
  it('sbarra a chi ha campi da dare', () => {
    expect(isProfileGateBlocked('incomplete')).toBe(true);
  });

  it('sbarra anche a chi il profilo non ce l’ha proprio', () => {
    // `missingProfileFields(null)` da solo direbbe «niente da chiedere»: è la trappola
    // che questo stato separato esiste per disinnescare.
    expect(isProfileGateBlocked('absent')).toBe(true);
  });

  it('NON sbarra finché il profilo è ignoto (avvio dell’app, o rete caduta)', () => {
    // `AuthContext` alza `profileLoaded` solo sull'assenza confermata dal server, quindi
    // un errore di rete resta `unknown`: sbarrare qui chiuderebbe fuori dall'app chi ha
    // il profilo completo per un guasto che non lo riguarda.
    expect(isProfileGateBlocked('unknown')).toBe(false);
  });

  it('NON sbarra al profilo completo', () => {
    expect(isProfileGateBlocked('complete')).toBe(false);
  });

  it('accetta anche i valori che si stanno per SCRIVERE, non solo un profilo salvato', () => {
    // È ciò che permette a cancello e salvataggio di condividere UN predicato: il
    // payload dell'upsert non è ancora un profilo (non ha id né consensi) e deve poter
    // essere giudicato prima di partire.
    const payload = {
      phone: '+393331234567',
      city: 'Roma',
      province: 'RM',
      country: 'IT',
      contact_email: 'vera@mail.it',
    };
    expect(isProfileGateBlocked(getProfileCompletion(payload, true))).toBe(
      false
    );
    expect(
      isProfileGateBlocked(
        getProfileCompletion({ ...payload, phone: null }, true)
      )
    ).toBe(true);
  });
});
