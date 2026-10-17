// Prove offline della catena leggi/verifica: nessuna suite Jest, fonte remota o scrittura.
import assert from 'node:assert/strict';
import { criterioConTitoli } from './titoli-jest.mjs';
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
};
