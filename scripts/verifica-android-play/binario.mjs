// C10: build EAS `production-store` installata e avviata sull'emulatore (contratto del goal
// android-play). La build si registra in docs/store/google-play/verifica/build.json (vedi aab.mjs).
import { join } from 'node:path';
import {
  PACKAGE,
  VERIFICA_DIR,
  crashDelPacchetto,
  esegui,
  esiste,
  exitDi,
  leggi,
  percorso,
  regexLogcatAvvio,
  sha256File,
  testiDump,
} from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { STRUMENTI } from './aab.mjs';

const FILE_SORVEGLIATI = [
  'src',
  'app.config.js',
  'eas.json',
  'package.json',
  'package-lock.json',
];
const leggiBuild = () => {
  const p = join(VERIFICA_DIR, 'build.json');
  if (!esiste(p)) return null;
  return JSON.parse(leggi(p));
};

export const criteri = {
  C10: {
    leggi() {
      const build = leggiBuild();
      if (!build)
        return { mancante: 'docs/store/google-play/verifica/build.json' };
      const eas = JSON.parse(
        esegui('npx', ['eas', 'build:view', build.id, '--json'])
      );
      const hash = eas.gitCommitHash;
      const f = n => join(VERIFICA_DIR, n);
      const attesiErrore = ['it', 'en'].map(l =>
        testoTraduzione(
          leggi(percorso('src', 'locales', `${l}.ts`)),
          'auth.errors.invalid_credentials'
        )
      );
      return {
        eas,
        antenato: hash
          ? exitDi('git', ['merge-base', '--is-ancestor', hash, 'HEAD'])
          : 1,
        diffPulito: hash
          ? exitDi('git', [
              'diff',
              '--quiet',
              hash,
              'HEAD',
              '--',
              ...FILE_SORVEGLIATI,
            ])
          : 1,
        jarSha: esiste(STRUMENTI.jar) ? sha256File(STRUMENTI.jar) : null,
        logcat: esiste(f('C10-logcat.txt')) ? leggi(f('C10-logcat.txt')) : null,
        screenshot: esiste(f('C10-accesso.png')),
        dumpErrore: esiste(f('C10-errore-server.xml'))
          ? leggi(f('C10-errore-server.xml'))
          : null,
        attesiErrore,
      };
    },
    verifica(i) {
      if (i.mancante) return `manca ${i.mancante}`;
      const e = i.eas;
      if (e.status !== 'FINISHED') return `build EAS in stato ${e.status}`;
      if (e.platform !== 'ANDROID') return `build per ${e.platform}`;
      if (e.buildProfile !== 'production-store')
        return `profilo ${e.buildProfile}, atteso production-store`;
      if (e.appVersion !== '1.3.0')
        return `appVersion ${e.appVersion}, atteso 1.3.0`;
      if (i.antenato !== 0)
        return 'il commit della build non è antenato di HEAD';
      if (i.diffPulito !== 0)
        return `dopo il commit della build sono cambiati: ${FILE_SORVEGLIATI.join(', ')}`;
      if (i.jarSha !== STRUMENTI.jarSha256)
        return 'bundletool assente o con sha256 diverso da quello pubblicato';
      if (!i.logcat) return 'manca C10-logcat.txt';
      if (!regexLogcatAvvio.test(i.logcat))
        return `il logcat non mostra l'avvio di ${PACKAGE}`;
      if (crashDelPacchetto(i.logcat))
        return `FATAL EXCEPTION di ${PACKAGE} nel logcat`;
      if (!i.screenshot) return 'manca C10-accesso.png';
      if (!i.dumpErrore)
        return 'manca C10-errore-server.xml (dump dopo l’accesso sbagliato)';
      const visti = testiDump(i.dumpErrore);
      if (!i.attesiErrore.some(t => t && visti.includes(t)))
        return 'a schermo non c’è l’errore «credenziali non corrette» restituito dal server';
      return null;
    },
  },
};
