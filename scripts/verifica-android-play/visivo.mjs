// C12, C16, C18, C21: prove visive (contratto del goal android-play).
// Il giudizio lo dà un critico indipendente, mai l'autore. Il suo verdetto sta in
// docs/store/google-play/verifica/visivo-<Cn>.txt con questa intestazione:
//   agente: <id dell'agente critico>
//   criterio: <Cn>
//   verdetto: PASS
//   sha256 <hash> <nome immagine>      (una riga per immagine giudicata)
//   ---
//   <verdetto parola per parola>
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  VERIFICA_DIR,
  configExpo,
  controllaSchermo,
  crashDelPacchetto,
  esiste,
  infoImmagine,
  leggi,
  percorso,
  pixelRGBA,
  regexLogcatAvvio,
  sha256File,
  testiDump,
} from './comune.mjs';

const RAGGIO_SICURO = 313; // 66 dp su 108 dp in un'icona 1024 px: cerchio sicuro del primo piano adattivo
const CHIAVE_GREZZA = /^[a-z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/;

const inVerifica = re =>
  esiste(VERIFICA_DIR)
    ? readdirSync(VERIFICA_DIR)
        .filter(n => re.test(n))
        .sort()
    : [];
const leggiOpz = p => (esiste(p) ? leggi(p) : null);

/** Legge visivo-<Cn>.txt e gli hash attuali delle immagini che dichiara. */
const leggiVerdetto = cn => {
  const testo = leggiOpz(join(VERIFICA_DIR, `visivo-${cn}.txt`));
  if (!testo) return null;
  const testa = testo.split(/^---$/m)[0];
  const giudicate = [
    ...testa.matchAll(/^sha256\s+([0-9a-f]{64})\s+(\S+)\s*$/gm),
  ].map(m => ({
    hash: m[1],
    nome: m[2],
    attuale: esiste(join(VERIFICA_DIR, m[2]))
      ? sha256File(join(VERIFICA_DIR, m[2]))
      : null,
  }));
  return {
    agente: testa.match(/^agente:\s*(\S+)/m)?.[1] ?? null,
    criterio: testa.match(/^criterio:\s*(\S+)/m)?.[1] ?? null,
    verdetto: testa.match(/^verdetto:\s*(\S+)\s*$/m)?.[1] ?? null,
    giudicate,
  };
};

/** Il verdetto copre ESATTAMENTE le immagini richieste, con hash uguali ai file attuali. */
export const controllaVerdetto = (cn, v, richieste) => {
  if (!v) return `manca visivo-${cn}.txt (verdetto del critico)`;
  if (!v.agente) return `visivo-${cn}.txt senza id dell'agente critico`;
  if (v.criterio !== cn) return `visivo-${cn}.txt riguarda ${v.criterio}`;
  if (v.verdetto !== 'PASS')
    return `il critico dice ${v.verdetto ?? 'niente'}, non PASS`;
  const nomi = v.giudicate.map(g => g.nome);
  const nonGiudicata = richieste.find(n => !nomi.includes(n));
  if (nonGiudicata) return `${nonGiudicata} non è stata giudicata dal critico`;
  const cambiata = v.giudicate.find(g => g.hash !== g.attuale);
  if (cambiata)
    return `${cambiata.nome}: hash diverso da quello giudicato (immagine cambiata o assente)`;
  return null;
};

const immaginiConInfo = async (dir, nomi) =>
  Promise.all(
    nomi.map(async nome => ({
      nome,
      sha: sha256File(join(dir, nome)),
      ...(await infoImmagine(join(dir, nome))),
    }))
  );

export const criteri = {
  C12: {
    async leggi() {
      const nomi = inVerifica(/^grande-.*\.png$/);
      return {
        immagini: await immaginiConInfo(VERIFICA_DIR, nomi),
        log: leggiOpz(join(VERIFICA_DIR, 'grande.log')),
        verdetto: leggiVerdetto('C12'),
      };
    },
    verifica({ immagini, log, verdetto }) {
      if (immagini.length < 3)
        return `screenshot grande-*.png: ${immagini.length}, servono almeno 3 (Home, Impatto, Profilo)`;
      const storta = immagini.find(
        i => i.larghezza !== 2560 || i.altezza !== 1600
      );
      if (storta)
        return `${storta.nome} è ${storta.larghezza}×${storta.altezza}, atteso 2560×1600 in orizzontale`;
      if (new Set(immagini.map(i => i.sha)).size !== immagini.length)
        return 'due screenshot identici';
      if (!log) return 'manca grande.log (wm size e wm density)';
      const schermo = controllaSchermo(log, '2560x1600');
      if (schermo) return schermo;
      return controllaVerdetto(
        'C12',
        verdetto,
        immagini.map(i => i.nome)
      );
    },
  },
  C16: {
    async leggi() {
      const g = percorso('docs', 'store', 'google-play', 'grafica');
      const s = percorso('docs', 'store', 'google-play', 'screenshot');
      const icona = join(g, 'icona-512.png');
      const evidenza = join(g, 'grafica-1024x500.png');
      const lingua = async l => {
        const dir = join(s, l);
        const nomi = esiste(dir)
          ? readdirSync(dir)
              .filter(n => n.endsWith('.png'))
              .sort()
          : [];
        return immaginiConInfo(dir, nomi);
      };
      const build = leggiOpz(join(VERIFICA_DIR, 'build.json'));
      const mappa = leggiOpz(join(s, 'screenshots.json'));
      return {
        icona: esiste(icona)
          ? { ...(await infoImmagine(icona)), byte: statSync(icona).size }
          : null,
        evidenza: esiste(evidenza) ? await infoImmagine(evidenza) : null,
        screenshot: { it: await lingua('it'), en: await lingua('en') },
        mappa: mappa ? JSON.parse(mappa) : null,
        idBuild: build ? JSON.parse(build).id : null,
        log: leggiOpz(join(s, 'screenshot.log')),
      };
    },
    verifica({ icona, evidenza, screenshot, mappa, idBuild, log }) {
      if (!icona) return 'manca grafica/icona-512.png';
      if (
        icona.formato !== 'png' ||
        icona.larghezza !== 512 ||
        icona.altezza !== 512 ||
        !icona.alfa
      )
        return `icona ${icona.larghezza}×${icona.altezza} ${icona.formato}, alfa=${icona.alfa}: attesa PNG 512×512 RGBA`;
      if (icona.byte > 1024 * 1024)
        return `icona di ${Math.round(icona.byte / 1024)} KB, massimo 1024`;
      if (!evidenza) return 'manca grafica/grafica-1024x500.png';
      if (
        evidenza.formato !== 'png' ||
        evidenza.larghezza !== 1024 ||
        evidenza.altezza !== 500 ||
        evidenza.alfa
      )
        return 'grafica in evidenza: attesa PNG 1024×500 senza alfa';
      for (const [l, lista] of Object.entries(screenshot)) {
        if (lista.length < 4)
          return `screenshot ${l}: ${lista.length}, servono almeno 4`;
        const storta = lista.find(
          i =>
            i.formato !== 'png' ||
            i.larghezza !== 1080 ||
            i.altezza !== 1920 ||
            i.alfa
        );
        if (storta)
          return `${l}/${storta.nome}: atteso PNG 1080×1920 senza alfa`;
      }
      if (!mappa) return 'manca screenshot/screenshots.json';
      if (!idBuild)
        return 'manca verifica/build.json: gli screenshot non sono legati a una build';
      for (const i of [...screenshot.it, ...screenshot.en]) {
        const voce = mappa[i.sha];
        if (!voce)
          return `${i.nome} non è in screenshots.json (sha256 diverso o assente)`;
        if (voce.build !== idBuild)
          return `${i.nome} viene da un'altra build (${voce.build})`;
        if (!voce.dispositivo)
          return `${i.nome} senza dispositivo in screenshots.json`;
        if (!['pubblico', 'demo'].includes(voce.account))
          return `${i.nome}: account ${voce.account}, ammessi pubblico o demo`;
      }
      if (!log) return 'manca screenshot/screenshot.log (wm size e wm density)';
      return controllaSchermo(log, '1080x1920');
    },
  },
  C18: {
    async leggi() {
      const a = configExpo().android?.adaptiveIcon ?? {};
      const file = p => (p ? percorso(p) : null);
      const fg = file(a.foregroundImage);
      const mono = file(a.monochromeImage);
      const launcher = inVerifica(/^launcher-.*\.png$/);
      return {
        primoPiano:
          fg && esiste(fg)
            ? {
                nome: a.foregroundImage,
                ...(await pixelRGBA(fg)),
                ...(await infoImmagine(fg)),
              }
            : null,
        monocromatica:
          mono && esiste(mono)
            ? { nome: a.monochromeImage, ...(await pixelRGBA(mono)) }
            : null,
        launcher,
        verdetto: leggiVerdetto('C18'),
      };
    },
    verifica({ primoPiano: f, monocromatica: m, launcher, verdetto }) {
      if (!f) return 'adaptiveIcon.foregroundImage assente o file mancante';
      if (f.larghezza !== 1024 || f.altezza !== 1024 || !f.alfa)
        return `${f.nome}: atteso 1024×1024 RGBA`;
      for (let y = 0; y < f.altezza; y++) {
        for (let x = 0; x < f.larghezza; x++) {
          if (f.data[(y * f.larghezza + x) * 4 + 3] === 0) continue;
          if (Math.hypot(x + 0.5 - 512, y + 0.5 - 512) > RAGGIO_SICURO)
            return `${f.nome}: pixel visibile in (${x},${y}), fuori dal cerchio sicuro di ${RAGGIO_SICURO} px`;
        }
      }
      if (!m) return 'adaptiveIcon.monochromeImage assente o file mancante';
      if (m.nome === f.nome)
        return 'la monocromatica è lo stesso file del primo piano: non è una maschera';
      let colore = null;
      for (let i = 0; i < m.data.length; i += 4) {
        if (m.data[i + 3] === 0) continue;
        const c = `${m.data[i]},${m.data[i + 1]},${m.data[i + 2]}`;
        if (colore === null) colore = c;
        else if (c !== colore)
          return `${m.nome}: più di un colore (${colore} e ${c}), non è una maschera`;
      }
      if (colore === null) return `${m.nome} è tutta trasparente`;
      if (!launcher.length)
        return 'manca lo screenshot del launcher (verifica/launcher-*.png)';
      return controllaVerdetto('C18', verdetto, launcher);
    },
  },
  C21: {
    async leggi() {
      const f = n => leggiOpz(join(VERIFICA_DIR, n));
      return {
        immagini: inVerifica(/^limite-.*\.png$/),
        navigazione: f('limite-3pulsanti.log'),
        indietro: f('limite-indietro.log'),
        offline: f('limite-offline-logcat.txt'),
        dumpDe: f('limite-de-DE.xml'),
        verdetto: leggiVerdetto('C21'),
      };
    },
    verifica({ immagini, navigazione, indietro, offline, dumpDe, verdetto }) {
      const richieste = [
        'limite-3pulsanti.png',
        'limite-indietro-prima.png',
        'limite-indietro-dopo.png',
        'limite-offline.png',
        'limite-de-DE.png',
      ];
      const manca = richieste.find(n => !immagini.includes(n));
      if (manca) return `manca ${manca}`;
      if (!navigazione || !/navigation_mode\D*0\b/.test(navigazione))
        return 'limite-3pulsanti.log non prova navigation_mode = 0';
      if (
        !indietro ||
        !/mCurrentFocus=.*org\.riseagainsthunger\.italia/.test(indietro)
      )
        return 'limite-indietro.log: dopo «indietro» l’app non è più in primo piano';
      if (!offline) return 'manca limite-offline-logcat.txt';
      if (!regexLogcatAvvio.test(offline))
        return 'il logcat offline non mostra l’avvio a freddo';
      if (crashDelPacchetto(offline)) return 'crash all’avvio offline';
      if (!dumpDe) return 'manca limite-de-DE.xml';
      const grezza = testiDump(dumpDe).find(t => CHIAVE_GREZZA.test(t.trim()));
      if (grezza)
        return `in de-DE compare una chiave di traduzione grezza: ${grezza}`;
      return controllaVerdetto('C21', verdetto, immagini);
    },
  },
};
