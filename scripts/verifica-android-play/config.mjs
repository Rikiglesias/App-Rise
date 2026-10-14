// C1-C5: configurazione Expo ed EAS (contratto del goal android-play).
// Ogni criterio = { leggi() → input, verifica(input) → motivo del FAIL | null }.
import {
  PACKAGE,
  configExpo,
  elencaFile,
  esiste,
  leggi,
  percorso,
  rel,
} from './comune.mjs';

const XML_RIMOSSI = [
  'android-network-security-config.xml',
  'android-network-security-config.prod.xml',
];
const CHIAVI_INERTI = [
  'compileSdkVersion',
  'targetSdkVersion',
  'minSdkVersion',
  'proguardFiles',
  'networkSecurityConfig',
];
// Nei docs una menzione è lecita solo se dice che la cosa non è più attiva.
const TEMA_DOCS =
  /network.?security|networkSecurityConfig|proguardFiles|compileSdkVersion|targetSdkVersion|minSdkVersion|pinning/i;
const MARCATORE_SUPERATO =
  /superat|rimoss|non (?:è |e' )?attiv|ritirat|non veniva applicat|mai applicat|tolt[ei]/i;
const RIGHE_CONTESTO = 8;

const senzaCommenti = src =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const versioneAlmeno = (v, minima) => {
  const a = String(v).split('.').map(Number);
  const b = minima.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== b[i]) return (a[i] ?? 0) > b[i];
  }
  return true;
};

export const criteri = {
  C1: {
    leggi: () => configExpo(),
    verifica(cfg) {
      const a = cfg.android ?? {};
      if (a.package !== PACKAGE)
        return `android.package = ${a.package}, atteso ${PACKAGE}`;
      const url = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
      if (a.playStoreUrl !== url)
        return `android.playStoreUrl = ${a.playStoreUrl}`;
      return null;
    },
  },
  C2: {
    // Anche i file `locales` (testi tradotti di Info.plist) possono portare la stringa
    // della fotocamera: si leggono insieme alla config.
    leggi: () => {
      const c = configExpo();
      const locali = Object.entries(c.locales ?? {}).map(([lingua, v]) => ({
        lingua,
        dati: typeof v === 'string' ? JSON.parse(leggi(percorso(v))) : v,
      }));
      return { ...c, locali };
    },
    verifica(cfg) {
      const permessi = cfg.android?.permissions ?? [];
      if (permessi.some(p => /(^|\.)CAMERA$/.test(p)))
        return 'CAMERA ancora tra i permessi Android';
      if (cfg.ios?.infoPlist?.NSCameraUsageDescription)
        return 'NSCameraUsageDescription ancora presente';
      const conCamera = (cfg.locali ?? []).find(({ dati }) =>
        [dati, dati?.ios, dati?.android].some(o => o?.NSCameraUsageDescription)
      );
      if (conCamera)
        return `NSCameraUsageDescription ancora nel file locales «${conCamera.lingua}»`;
      if (
        !(cfg.android?.blockedPermissions ?? []).includes(
          'com.google.android.gms.permission.AD_ID'
        )
      )
        return 'AD_ID non è in android.blockedPermissions';
      return null;
    },
  },
  C3: {
    leggi: () => ({
      sorgente: leggi(percorso('app.config.js')),
      xmlPresenti: XML_RIMOSSI.filter(f => esiste(percorso(f))),
      docs: elencaFile(percorso('docs'), p => p.endsWith('.md')).map(p => ({
        nome: rel(p),
        testo: leggi(p),
      })),
    }),
    verifica({ sorgente, xmlPresenti, docs }) {
      const codice = senzaCommenti(sorgente);
      const chiave = CHIAVI_INERTI.find(k =>
        new RegExp(`\\b${k}\\s*:`).test(codice)
      );
      if (chiave) return `app.config.js contiene ancora la chiave ${chiave}`;
      if (xmlPresenti.length)
        return `file ancora presenti: ${xmlPresenti.join(', ')}`;
      for (const { nome, testo } of docs) {
        const righe = testo.split(/\r?\n/);
        for (let i = 0; i < righe.length; i++) {
          if (!TEMA_DOCS.test(righe[i])) continue;
          // Contesto = le righe sopra (titolo della sezione) + il paragrafo intero della riga.
          let fine = i;
          while (fine + 1 < righe.length && righe[fine + 1].trim()) fine++;
          const contesto = righe
            .slice(Math.max(0, i - RIGHE_CONTESTO), fine + 1)
            .join('\n');
          if (!MARCATORE_SUPERATO.test(contesto))
            return `${nome}:${i + 1} descrive come attivo: «${righe[i].trim().slice(0, 90)}»`;
        }
      }
      return null;
    },
  },
  C4: {
    leggi: () => configExpo(),
    verifica(cfg) {
      if (cfg.version !== '1.3.0')
        return `expo.version = ${cfg.version}, atteso 1.3.0`;
      if (cfg.runtimeVersion?.policy !== 'appVersion')
        return `runtimeVersion = ${JSON.stringify(cfg.runtimeVersion)}, atteso { policy: 'appVersion' }`;
      return null;
    },
  },
  C5: {
    leggi: () => JSON.parse(leggi(percorso('eas.json'))),
    verifica(eas) {
      const prod = eas.build?.production ?? {};
      if (prod.environment !== 'production')
        return `build.production.environment = ${prod.environment}`;
      if (eas.build?.['production-store']?.android?.autoIncrement !== true)
        return 'build.production-store.android.autoIncrement non è true';
      if (!prod.node || !versioneAlmeno(prod.node, '20.19.4'))
        return `build.production.node = ${prod.node}`;
      const profili = Object.entries(eas.submit ?? {}).filter(
        ([, p]) => p.android
      );
      if (!profili.length) return 'nessun profilo submit con sezione android';
      for (const [nome, p] of profili) {
        if (p.android.track !== 'internal')
          return `submit.${nome}.android.track = ${p.android.track}`;
        if (p.android.releaseStatus !== 'draft')
          return `submit.${nome}.android.releaseStatus = ${p.android.releaseStatus}`;
      }
      return null;
    },
  },
};
