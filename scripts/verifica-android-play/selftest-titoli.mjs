// Prove offline della catena leggi/verifica: nessuna suite Jest, fonte remota o scrittura.
import assert from 'node:assert/strict';
import {
  BASE_CONTROPROVA,
  BASE_R27,
  criterioConTitoli,
  esitoControprova,
} from './titoli-jest.mjs';
import { regressioneControprova } from './controprova-storia.mjs';
import { selftestSorvegliati } from './selftest-sorvegliati.mjs';
import { DEFINIZIONI_PAGINE } from './pagine.mjs';
import { verde } from './selftest-codice.mjs';
import { selftestLettoreLocalita } from './selftest-localita.mjs';

export const selftestLettori = async () => {
  const def = { prova: { titoli: ['titolo'], guardie: ['guardia'] } };
  const ok = verde('prova', null, def);
  const lettori = {
    leggiControprova: () => ok.controprova,
    suite: () => ok.jest,
    shaFile: () => ok.shaAttuali,
    storiaControprova: () => ok.storia,
  };
  const verifica = dati => (dati.valore === 42 ? '' : 'dato non risolto');
  for (const leggi of [() => ({ valore: 42 }), async () => ({ valore: 42 })]) {
    const c = criterioConTitoli(
      'prova',
      { ...def.prova, statico: { leggi, verifica } },
      lettori
    );
    const dati = await c.leggi();
    assert.deepEqual(dati.statico, { valore: 42 });
    assert.equal(await c.verifica(dati), '');
  }
  const asincrono = criterioConTitoli(
    'prova',
    {
      ...def.prova,
      statico: {
        async leggi({ jest, titoli }) {
          assert.deepEqual(jest, ok.jest);
          assert.deepEqual(titoli, ['titolo', 'guardia']);
          return { valore: 42 };
        },
        async verifica(dati) {
          return verifica(dati);
        },
      },
    },
    Object.fromEntries(
      Object.entries(lettori).map(([k, fn]) => [k, async () => fn()])
    )
  );
  assert.equal(await asincrono.verifica(await asincrono.leggi()), '');
  const errore = new Error('fonte non disponibile');
  const fallisce = criterioConTitoli(
    'prova',
    {
      ...def.prova,
      statico: {
        async leggi() {
          throw errore;
        },
        verifica,
      },
    },
    lettori
  );
  await assert.rejects(
    () => fallisce.leggi(),
    e => e === errore
  );
  const verificaFallisce = criterioConTitoli(
    'prova',
    {
      ...def.prova,
      statico: {
        leggi: () => ({}),
        async verifica() {
          throw errore;
        },
      },
    },
    lettori
  );
  await assert.rejects(
    () => verificaFallisce.verifica(ok),
    e => e === errore
  );
  for (const id of ['C7', 'C37', 'C39'])
    assert.equal(
      DEFINIZIONI_PAGINE[id].statico.leggi.constructor.name,
      'AsyncFunction'
    );
  selftestLettoreLocalita();
  selftestStoria();
  selftestSorvegliati();
};

// Regola R27-R29 delle controprove: base 13fa640 rigorosa, esito alla base conservato quando si rifà.
const selftestStoria = () => {
  const r27 = verde('p', null, { p: { titoli: ['t'], base: BASE_R27 } });
  assert.match(
    esitoControprova(
      ['t'],
      { ...r27.controprova, esitiAllaBase: { t: 'assente' } },
      r27.shaAttuali,
      BASE_R27
    ),
    /assenti alla base 13fa640/,
    'titolo assente alla base 13fa640 → FAIL'
  );
  const vecchio = { base: BASE_CONTROPROVA, esitiAllaBase: { t: 'failed' } };
  const nuovo = esiti => ({ base: BASE_CONTROPROVA, esitiAllaBase: esiti });
  assert.equal(regressioneControprova(vecchio, nuovo({ t: 'failed' })), '');
  assert.match(
    regressioneControprova(vecchio, nuovo({ t: 'assente' })),
    /assente/,
    'un failed che diventa assente su una base non rigorosa → FAIL'
  );
  assert.match(
    regressioneControprova(vecchio, nuovo({ t: 'passed' })),
    /failed/,
    'un failed che diventa verde → FAIL'
  );
  assert.equal(
    regressioneControprova(
      { ...vecchio, esitiAllaBase: { t: 'assente' } },
      nuovo({ t: 'assente' })
    ),
    '',
    'assente che resta assente su una base non rigorosa: ammesso'
  );
  assert.equal(
    regressioneControprova(vecchio, nuovo({ altro: 'failed' })),
    '',
    'titolo tolto dal criterio: niente confronto'
  );
  assert.equal(regressioneControprova(null, nuovo({ t: 'passed' })), '');
};
