// Fixture di `staticoC89` (C89 R30-R33) per selftest-f13-r27.mjs: un positivo completo, ogni negativa è il
// positivo con UNA mutazione, e i positivi in più provano che il parsing non si fa ingannare.
import {
  AZIONI_C89,
  CHIAVI_DELETE_C89,
  CONTESTO_C89,
} from './f13-r27-cancellazione.mjs';

const TESTO_IT =
  "'Connessione interrotta: riprova per completare l\\'eliminazione.'";
const TESTO_EN =
  "'Connection interrupted: try again to complete the deletion.'";
const voci = chiavi => chiavi.map(k => `      ${k}: 'x',`).join('\n');

const locale = ({
  chiavi = CHIAVI_DELETE_C89,
  extra = '',
  interrotta,
  prima = '',
}) =>
  `export default {\n${prima}  auth: {\n    delete: {\n${voci(chiavi)}\n${extra}    },\n    errors: {\n      network: 'n',\n${interrotta === null ? '' : `      delete_interrupted: ${interrotta},\n`}    },\n  },\n};\n`;

const azioni = (
  tipo = '{\n  error: string | null;\n  sessioneAncoraSulDispositivo?: boolean;\n}'
) =>
  `export const deleteAccountNow = async (): Promise<${tipo}> => {\n  return { error: null };\n};\n`;
const contesto = (
  tipo = '{\n    error: string | null;\n    sessioneAncoraSulDispositivo?: boolean;\n  }'
) =>
  `export interface AuthState {\n  deleteAccountNow: () => Promise<${tipo}>;\n}\nconst v = { deleteAccountNow: eliminaAccountOra };\n`;

const it = opz => locale({ interrotta: TESTO_IT, ...opz });
const en = opz => locale({ interrotta: TESTO_EN, ...opz });
const locali = (mIt = {}, mEn = {}) => ({
  locali: { it: it(mIt), en: en(mEn) },
});

export const OK_C89 = {
  ...locali(),
  azioni: azioni(),
  contesto: contesto(),
  sorgenti: { [AZIONI_C89]: azioni(), [CONTESTO_C89]: contesto() },
};

const senza = (lista, k) => lista.filter(x => x !== k);

export const MUTAZIONI_C89 = [
  locali({ extra: "      esitoIncerto: 'non sappiamo',\n" }),
  locali({ extra: "      incerto: 'non sappiamo',\n" }),
  locali({}, { chiavi: senza(CHIAVI_DELETE_C89, 'done') }),
  locali({
    chiavi: senza(CHIAVI_DELETE_C89, 'done'),
    extra: "      'done': 'x',\n",
  }),
  locali({ extra: '      ...altre,\n' }),
  locali({}, { chiavi: [...senza(CHIAVI_DELETE_C89, 'cancel'), 'annulla'] }),
  locali({}, { interrotta: "''" }),
  locali({ interrotta: null }),
  locali({ interrotta: "'Operazione non riuscita. Riprova.'" }),
  {
    azioni: azioni(
      '{\n  error: string | null;\n  sessioneAncoraSulDispositivo?: boolean;\n  incerto?: boolean;\n}'
    ),
  },
  {
    contesto: contesto(
      '{\n    error: string | null;\n    sessioneAncoraSulDispositivo?: boolean;\n    incerto?: boolean;\n  }'
    ),
  },
  {
    azioni:
      'export const deleteAccountNow = async () => {\n  return { error: null };\n};\n',
  },
  { contesto: contesto('EsitoEliminazione') },
  {
    azioni: azioni(
      '{\n  error: string | null;\n  sessioneAncoraSulDispositivo?: boolean;\n} & Extra'
    ),
  },
  {
    sorgenti: {
      ...OK_C89.sorgenti,
      'src/shared/x.ts': '// esitoIncerto: tolto\n',
    },
  },
  { locali: { it: null, en: en() } },
];

export const POSITIVI_C89 = [
  // apostrofo tipografico nel testo italiano
  locali({
    interrotta:
      "'Connessione interrotta: riprova per completare l’eliminazione.'",
  }),
  // un `delete: { … }` annidato altrove, prima di `auth`, non si confonde con auth.delete
  locali({
    prima: "  common: {\n    delete: {\n      incerto: 'x',\n    },\n  },\n",
  }),
  // commenti con apostrofi e parentesi dentro il blocco, stringhe con parentesi e URL
  locali({
    extra: "      // l'app: { niente qui (\n      /* altro } ' */\n",
    prima: "  link: { sito: 'https://x.it/(a', nota: 'una ) sola' },\n",
  }),
];
