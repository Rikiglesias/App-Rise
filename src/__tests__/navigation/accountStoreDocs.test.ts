import fs from 'fs';
import path from 'path';
import italian from '@/locales/it';
import english from '@/locales/en';

const store = path.resolve(__dirname, '../../..', 'docs/store/google-play');
const read = (file: string) => fs.readFileSync(path.join(store, file), 'utf8');
const textFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? textFiles(file)
      : /\.(md|html)$/.test(entry.name)
        ? [file]
        : [];
  });

it('istruzioni Play: ingresso dalla quarta scheda con etichette delle traduzioni', () => {
  const files = textFiles(store);
  expect(files.length).toBeGreaterThan(0);
  const obsolete = /icona del profilo|profile icon|in alto a destra|top right/i;
  // Positivo della sonda d'assenza: riconosce tutte le istruzioni vietate.
  for (const text of [
    'icona del profilo',
    'profile icon',
    'in alto a destra',
    'top right',
  ]) {
    expect(obsolete.test(text)).toBe(true);
  }
  expect(
    files.filter(file => obsolete.test(fs.readFileSync(file, 'utf8')))
  ).toEqual([]);
  const answers = read('play-console-risposte.md');
  expect(answers).toContain(`quarta scheda «${italian.navigation.profile}»`);
  expect(answers).toContain(`«${english.navigation.profile}»`);
  expect(read('web/elimina-account.html')).toContain(
    `<strong>${italian.navigation.profile}</strong>`
  );
  expect(read('web/elimina-account.html')).toContain('quarta');
  expect(read('web/delete-account.html')).toContain(
    `<strong>${english.navigation.profile}</strong>`
  );
  expect(read('web/delete-account.html')).toContain('fourth tab');
  const responsibilities = read('rilascio.md').split('## Chi fa cosa')[1];
  expect(responsibilities).toContain('già state consegnate alla sede USA');
  expect(responsibilities).toContain('sostituire quelle precedenti');
});
