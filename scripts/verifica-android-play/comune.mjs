// Helper condivisi dai controlli di scripts/verifica-android-play.mjs (goal android-play).
// Sola lettura: nessun helper scrive nel repo.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
export const PACKAGE = 'org.riseagainsthunger.italia';
export const SUPABASE_REF = 'yrsilvbuqhohgznpdles';
export const VERIFICA_DIR = join(
  ROOT,
  'docs',
  'store',
  'google-play',
  'verifica'
);

export const percorso = (...parti) => join(ROOT, ...parti);
export const esiste = p => existsSync(p);
export const leggi = p => readFileSync(p, 'utf8');
export const sha256 = dati => createHash('sha256').update(dati).digest('hex');
export const sha256File = p => sha256(readFileSync(p));
export const rel = p => relative(ROOT, p).split('\\').join('/');

/** Elenco ricorsivo dei file sotto `dir` che passano `filtro(percorsoAssoluto)`. */
export const elencaFile = (dir, filtro = () => true) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome.startsWith('.')) continue;
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...elencaFile(p, filtro));
    else if (filtro(p)) out.push(p);
  }
  return out;
};

/**
 * Esegue un comando e restituisce stdout. Un exit diverso da 0 è un errore con stderr
 * allegato: un comando fallito non deve mai sembrare un risultato vuoto.
 */
export const esegui = (
  cmd,
  args,
  { env, input, cwd = ROOT, binario = false } = {}
) => {
  const r = spawnSync(cmd, args, {
    cwd,
    env: env ?? process.env,
    input,
    encoding: binario ? 'buffer' : 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell: process.platform === 'win32' && !/[\\/]/.test(cmd),
  });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) {
    const err = String(r.stderr ?? '')
      .trim()
      .split(/\r?\n/)
      .slice(-5)
      .join(' | ');
    throw new Error(`${cmd} ${args[0] ?? ''} exit ${r.status}: ${err}`);
  }
  return r.stdout;
};

/** Esito con exit code, per i comandi dove il codice di uscita È la risposta (es. git). */
export const exitDi = (cmd, args, { cwd = ROOT } = {}) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  return r.status;
};

let configCache = null;
/** Config Expo risolta come la vede EAS, senza override di pacchetto dall'ambiente. */
export const configExpo = () => {
  if (!configCache) {
    const env = { ...process.env };
    delete env.ANDROID_PACKAGE;
    delete env.IOS_BUNDLE_IDENTIFIER;
    configCache = JSON.parse(
      esegui('npx', ['expo', 'config', '--json', '--type', 'public'], { env })
    );
  }
  return configCache;
};

/** Dimensioni e canali di un'immagine (sharp è devDependency diretta del progetto). */
export const infoImmagine = async p => {
  const { default: sharp } = await import('sharp');
  const m = await sharp(p).metadata();
  return {
    formato: m.format,
    larghezza: m.width,
    altezza: m.height,
    alfa: Boolean(m.hasAlpha),
    canali: m.channels,
  };
};

/** Pixel RGBA grezzi (per i controlli sull'icona). */
export const pixelRGBA = async p => {
  const { default: sharp } = await import('sharp');
  const { data, info } = await sharp(p)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, larghezza: info.width, altezza: info.height };
};

/** Testo dei nodi di un dump `uiautomator` (attributi text e content-desc), già decodificato. */
export const testiDump = xml => {
  const dec = s =>
    s
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&amp;/g, '&');
  return [...xml.matchAll(/\s(?:text|content-desc)="([^"]*)"/g)]
    .map(m => dec(m[1]))
    .filter(Boolean);
};

export const normalizzaSpazi = s => s.replace(/\s+/g, ' ').trim();

/** Voci del markdown: titolo, riga di tabella, punto d'elenco o paragrafo (righe di seguito unite). */
export const voci = md => {
  const out = [];
  let aperta = false;
  for (const riga of md.split('\n')) {
    if (!riga.trim()) {
      aperta = false;
      continue;
    }
    if (aperta && !/^\s*(?:[-*|#]|\d+\.)/.test(riga))
      out[out.length - 1] += ` ${riga.trim()}`;
    else out.push(riga.trim());
    // Un titolo non continua sulla riga dopo.
    aperta = !riga.startsWith('#');
  }
  return out;
};

/** Righe `wm size` / `wm density` di un log: atteso senza override. */
export const controllaSchermo = (log, dimensioneAttesa) => {
  const size = log.match(/Physical size:\s*(\d+x\d+)/);
  if (!size) return 'il log non riporta `wm size` (Physical size)';
  const attese = [
    dimensioneAttesa,
    dimensioneAttesa.split('x').reverse().join('x'),
  ];
  if (!attese.includes(size[1]))
    return `wm size ${size[1]}, atteso ${dimensioneAttesa}`;
  if (/Override size/.test(log))
    return 'wm size con override: lo schermo è simulato, non è il dispositivo';
  if (!/Physical density:\s*\d+/.test(log))
    return 'il log non riporta `wm density` (Physical density)';
  if (/Override density/.test(log)) return 'wm density con override';
  return null;
};

export const regexLogcatAvvio = new RegExp(
  `Start proc \\d+:${PACKAGE.replace(/\./g, '\\.')}`
);
/** Un crash del NOSTRO processo nel logcat (le eccezioni di altri processi non contano). */
export const crashDelPacchetto = log => {
  const blocchi = log.split(/FATAL EXCEPTION/).slice(1);
  return blocchi.some(b => b.slice(0, 400).includes(`Process: ${PACKAGE}`));
};
