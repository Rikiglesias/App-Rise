// C6: ambiente EAS `production` (contratto del goal android-play). Nessun valore viene stampato:
// i motivi di FAIL citano solo nomi di variabili e confronti fra hash.
import { SUPABASE_REF, esegui, sha256 } from './comune.mjs';

const NOMI_SUPABASE = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];
const VIETATE = [
  'EXPO_PUBLIC_SENTRY_DSN',
  'ANDROID_PACKAGE',
  'IOS_BUNDLE_IDENTIFIER',
];

/** `eas env:list <ambiente> --format short` → { NOME: valore }. */
export const parseEnvList = testo =>
  Object.fromEntries(
    testo
      .split(/\r?\n/)
      .map(l => l.match(/^([A-Z][A-Z0-9_]*)=(.*)$/))
      .filter(Boolean)
      .map(m => [m[1], m[2]])
  );

const leggiAmbiente = nome =>
  parseEnvList(
    esegui('npx', [
      'eas',
      'env:list',
      nome,
      '--include-sensitive',
      '--format',
      'short',
    ])
  );

const payloadJwt = token => {
  const parti = token.split('.');
  if (parti.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parti[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

/**
 * La chiave apre davvero una richiesta? GET di sola lettura su `/auth/v1/settings` (R16-R17): la forma della chiave
 * non basta, una JWT `anon` ben fatta riceve 401 da quando le chiavi legacy sono disattivate (06/07/2026).
 * Restituisce solo lo stato HTTP o il tipo di guasto, mai la chiave né il corpo.
 */
export const sondaChiave = async (url, chiave, fetchFn = fetch) => {
  try {
    const res = await fetchFn(`${url}/auth/v1/settings`, {
      headers: { apikey: chiave },
      signal: AbortSignal.timeout(10_000),
    });
    return { status: res.status };
  } catch (err) {
    const nome = err instanceof Error ? err.name : '';
    return {
      errore:
        nome === 'TimeoutError' || nome === 'AbortError' ? 'timeout' : 'rete',
    };
  }
};

export const criteri = {
  C6: {
    async leggi() {
      const production = leggiAmbiente('production');
      const url = production.EXPO_PUBLIC_SUPABASE_URL;
      const chiave = production.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      return {
        production,
        preview: leggiAmbiente('preview'),
        sonda: url && chiave ? await sondaChiave(url, chiave) : null,
      };
    },
    verifica({ production, preview, sonda }) {
      for (const nome of NOMI_SUPABASE) {
        const v = production[nome];
        if (v === undefined) return `${nome} assente in production`;
        if (!v.trim()) return `${nome} vuota in production`;
        if (/^\*+$/.test(v))
          return `${nome} mascherata in production (valore non leggibile)`;
        if (preview[nome] === undefined)
          return `${nome} assente in preview: confronto impossibile`;
        if (sha256(v) !== sha256(preview[nome]))
          return `${nome}: sha256 production ≠ preview`;
      }
      let host;
      try {
        host = new URL(production.EXPO_PUBLIC_SUPABASE_URL).host;
      } catch {
        return 'EXPO_PUBLIC_SUPABASE_URL non è un URL';
      }
      if (host !== `${SUPABASE_REF}.supabase.co`)
        return `URL di un altro progetto (host ${host.split('.')[0]}…)`;
      const chiave = production.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (chiave.startsWith('sb_secret_'))
        return 'la chiave è SEGRETA (sb_secret_): mai in un bundle';
      if (!chiave.startsWith('sb_publishable_'))
        return payloadJwt(chiave)
          ? 'la chiave è una JWT legacy: le chiavi legacy del progetto sono disattivate, serve sb_publishable_'
          : 'la chiave non è sb_publishable_';
      if (!sonda) return 'sonda della chiave non eseguita';
      if (sonda.errore)
        return `sonda della chiave fallita (${sonda.errore}) su /auth/v1/settings`;
      if (sonda.status !== 200)
        return `la chiave non apre /auth/v1/settings: HTTP ${sonda.status}, atteso 200`;
      const vietata = VIETATE.find(n => n in production);
      if (vietata) return `${vietata} presente in production`;
      if (production.APP_ENV === 'development')
        return 'APP_ENV = development in production';
      return null;
    },
  },
};
