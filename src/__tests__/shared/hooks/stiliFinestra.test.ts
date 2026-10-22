/**
 * Sentinella di C54 (contratto android-play): le misure del Perfect System (`scale()` e famiglia) leggono
 * la finestra di adesso, quindi un valore memorizzato senza dipendere dalla finestra resta alla misura del
 * primo disegno quando si apre un pieghevole o si ridimensiona la finestra. Vale per tutto `src/`, anche
 * fuori dalle pagine provate dai test di rotazione.
 */
import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '../../..');
const sorgenti = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(voce => {
    const p = path.join(dir, voce.name);
    if (voce.isDirectory()) return voce.name === '__tests__' ? [] : sorgenti(p);
    return /\.(ts|tsx)$/.test(voce.name) && !/\.test\./.test(voce.name)
      ? [p]
      : [];
  });

// Indice della parentesi che chiude quella aperta in `da`.
const chiusura = (testo: string, da: number): number => {
  let livello = 0;
  for (let i = da; i < testo.length; i++) {
    const c = testo[i];
    if (c === '(' || c === '[' || c === '{') livello++;
    else if (c === ')' || c === ']' || c === '}') {
      livello--;
      if (livello === 0) return i;
    }
  }
  return -1;
};

const SCALA =
  /\b(scale|scaleSpacing|scaleTouch|scaleIcon|scaleBadge|scaleClamp|scaleText|getWindowDimensions)\(/;
const FABBRICA = /\b(create|make)\w*\(\s*\)/;
const FINESTRA = /\b(colors|finestra|window|width|height)\b/;

// Commenti sostituiti da spazi (stesse righe): un esempio scritto in un commento non è codice.
const senzaCommenti = (testo: string): string =>
  testo
    .replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

/** `nome:riga` dei useMemo/useCallback che misurano senza dipendere dalla finestra. */
const memoFermi = (nome: string, sorgente: string): string[] => {
  const testo = senzaCommenti(sorgente);
  const fermi: string[] = [];
  const re = /\buse(?:Memo|Callback)\s*(?:<[^>]*>)?\s*\(/g;
  for (let m = re.exec(testo); m; m = re.exec(testo)) {
    const apre = m.index + m[0].length - 1;
    const dentro = testo.slice(apre + 1, chiusura(testo, apre));
    const dipendenze = dentro.match(/,\s*(\[[^\]]*\])\s*,?\s*$/)?.[1] ?? '';
    const misura = SCALA.test(dentro) || FABBRICA.test(dentro);
    if (misura && !FINESTRA.test(dipendenze))
      fermi.push(`${nome}:${testo.slice(0, m.index).split('\n').length}`);
  }
  return fermi;
};

describe('C54 sentinella', () => {
  const file = sorgenti(SRC);

  it('finestra: la sonda vede un memo fermo', () => {
    const fermi = [
      'const a = useMemo(() => ({ p: scale(10) }), []);',
      'const b = useMemo(() => createStyles(), []);',
      'const c = useMemo(() => (big ? scale(32) : scale(26)), [big]);',
      'const d = useMemo(() => createStyles(colors), [colors]);',
      'const e = useMemo(() => scale(4) * n, [n, finestra]);',
      '// const f = useMemo(() => createStyles(), []);',
    ].join('\n');
    expect(memoFermi('prova', fermi)).toEqual([
      'prova:1',
      'prova:2',
      'prova:3',
    ]);
  });

  it('finestra: nessuna misura memorizzata senza la finestra', () => {
    expect(file.length).toBeGreaterThan(100);
    expect(
      file.flatMap(f =>
        memoFermi(path.relative(SRC, f), fs.readFileSync(f, 'utf8'))
      )
    ).toEqual([]);
  });

  it('finestra: colori del tema solo da useAdaptiveColors', () => {
    const fuori = file.filter(
      f =>
        !/useThemeColors\.ts$|adaptiveColors\.ts$/.test(f) &&
        /\bgetAdaptiveColors\(/.test(fs.readFileSync(f, 'utf8'))
    );
    expect(fuori.map(f => path.relative(SRC, f))).toEqual([]);
  });
});
