import fs from 'fs';
import path from 'path';
import italian from '@/locales/it';
import english from '@/locales/en';

// Gemello Jest dello statico di C30 (scripts/verifica-android-play/login.mjs).
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
// Come lo statico: via tag, virgolette e asterischi, spazi compattati.
const normalize = (text: string) =>
  text
    .replace(/<[^>]+>/g, ' ')
    .replace(/[«»"*]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
const OBSOLETE = [
  'quarta scheda',
  '4ª scheda',
  'fourth tab',
  'barra in basso',
  'bottom bar',
  'scheda profilo',
  'profile tab',
];
const between = (text: string, start: string, end: RegExp) => {
  const from = text.indexOf(start);
  expect(from).toBeGreaterThanOrEqual(0);
  const rest = text.slice(from + start.length);
  const stop = rest.search(end);
  return stop < 0 ? rest : rest.slice(0, stop);
};

it("istruzioni Play: ingresso dall'icona in alto a destra con etichette delle traduzioni", () => {
  const files = textFiles(store);
  expect(files.length).toBeGreaterThan(0);
  const stale = (text: string) =>
    OBSOLETE.filter(phrase => normalize(text).includes(phrase));
  // Positivo della sonda d'assenza: riconosce le frasi vietate anche dentro tag e virgolette.
  expect(stale('la scheda <strong>Profilo</strong>')).toEqual([
    'scheda profilo',
  ]);
  for (const phrase of OBSOLETE) expect(stale(phrase)).toEqual([phrase]);
  expect(
    files.filter(file => stale(fs.readFileSync(file, 'utf8')).length > 0)
  ).toEqual([]);

  const access = between(
    read('play-console-risposte.md'),
    "## Accesso all'app",
    /^## /m
  );
  expect(access).toContain(`«${italian.auth.login.title}»`);
  expect(access).toContain(`«${english.auth.login.title}»`);
  expect(access).toContain('in alto a destra');

  const steps = [
    [
      'web/elimina-account.html',
      'id="dall-app"',
      italian,
      'in alto a destra',
      'icona',
    ],
    [
      'web/delete-account.html',
      'id="in-the-app"',
      english,
      'top right',
      'icon',
    ],
  ] as const;
  for (const [file, anchor, locale, where, icon] of steps) {
    const section = between(read(file), anchor, /<h2/);
    expect(section).toContain(`<strong>${locale.auth.login.title}</strong>`);
    expect(section).toContain(`<strong>${locale.auth.profile.title}</strong>`);
    expect(section).toContain(where);
    expect(section).toContain(icon);
  }

  const responsibilities = read('rilascio.md').split('## Chi fa cosa')[1];
  expect(responsibilities).toContain('già state consegnate alla sede USA');
  expect(responsibilities).toContain('sostituire quelle precedenti');
});
