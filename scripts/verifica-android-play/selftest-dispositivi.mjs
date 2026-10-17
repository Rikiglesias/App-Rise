// C22 per i criteri di F10 (telefoni) e F11 (contenuti): mutazioni comuni dei criteri a titoli più gli statici.
// Ogni fixture negativa è il positivo con UNA mutazione.
import {
  DEFINIZIONI_CONTENUTI,
  FILE_C52,
  NOME_LEGALE,
  SOCIAL_C48,
} from './contenuti.mjs';
import { DEFINIZIONI_DISPOSITIVI, RADICI_C44 } from './dispositivi.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';

const DEF = { ...DEFINIZIONI_DISPOSITIVI, ...DEFINIZIONI_CONTENUTI };
const v = (id, statico = null) => verde(id, statico, DEF);
const n = (id, statico = null) => negativiComuni(id, statico, DEF);
const soloTitoli = id => ({ neg: n(id), pos: [v(id)] });

// --- C44 ---
const RADICI_OK = Object.fromEntries(
  RADICI_C44.map(r => [r, 'const h = useBottomTabBarHeight();'])
);
const C44_OK = {
  file: [{ nome: 'src/a.tsx', testo: 'const x = 1;' }],
  radici: RADICI_OK,
};
const c44 = mut => v('C44', { ...C44_OK, ...mut });

// --- C45 ---
const C45_OK = { testo: 'const { isTablet } = useDeviceType();' };

// --- C48 ---
const urls = (mut = {}) =>
  Object.entries({ ...SOCIAL_C48, ...mut })
    .filter(([, u]) => u != null)
    .map(([k, u]) => `  ${k}: '${u}',`)
    .join('\n');
const C48_OK = { urls: urls() };

// --- C52 ---
const docs = (mut = {}) => ({
  ...Object.fromEntries(
    FILE_C52.map(f => [f, `Titolare: ${NOME_LEGALE}, C.F. 91349460377`])
  ),
  ...mut,
});
const C52_OK = { file: docs(), appName: { it: 'Rise Against Hunger Italia' } };
const c52 = mut => ({ statico: { ...C52_OK, ...mut } });

export const FIXTURE_DISPOSITIVI = {
  C41: soloTitoli('C41'),
  C42: soloTitoli('C42'),
  C43: soloTitoli('C43'),
  C44: {
    neg: [
      ...n('C44', C44_OK),
      c44({ file: [] }),
      c44({
        file: [
          {
            nome: 'src/features/impact/screens/ImpactTabScreen.tsx',
            testo: 'const TAB_BAR_HEIGHT = 95;',
          },
        ],
      }),
      c44({
        file: [
          {
            nome: 'src/x.tsx',
            testo: 'paddingBottom: insets.bottom + 95 + 24',
          },
        ],
      }),
      c44({ radici: { ...RADICI_OK, [RADICI_C44[0]]: null } }),
      c44({
        radici: {
          ...RADICI_OK,
          [RADICI_C44[2]]: 'paddingBottom: insets.bottom',
        },
      }),
    ],
    pos: [
      v('C44', C44_OK),
      c44({
        radici: {
          ...RADICI_OK,
          [RADICI_C44[3]]: 'useContext(BottomTabBarHeightContext)',
        },
      }),
    ],
  },
  C45: {
    neg: [
      ...n('C45', C45_OK),
      v('C45', { testo: null }),
      v('C45', { testo: `${C45_OK.testo}\nconst isTablet = width >= 768;` }),
      v('C45', { testo: `${C45_OK.testo}\nconst isPhablet = width >= 600;` }),
      v('C45', { testo: 'const { width } = useWindowDimensions();' }),
    ],
    pos: [
      v('C45', C45_OK),
      v('C45', { testo: `${C45_OK.testo}\nconst d = 7680;` }),
    ],
  },
  C46: soloTitoli('C46'),
  C54: soloTitoli('C54'),
  C48: {
    neg: [
      ...n('C48', C48_OK),
      v('C48', { urls: null }),
      v('C48', { urls: urls({ youtube: null }) }),
      v('C48', {
        urls: urls({
          instagram: 'https://www.instagram.com/riseagainsthunger_italia/',
        }),
      }),
      v('C48', {
        urls: urls({ facebook: 'https://www.facebook.com/RAHItalia/' }),
      }),
      v('C48', {
        urls: `${urls()}\n  instagramShort: 'https://instagram.com/riseagainsthungeritalia',`,
      }),
    ],
    pos: [v('C48', C48_OK)],
  },
  C49: soloTitoli('C49'),
  C50: soloTitoli('C50'),
  C51: soloTitoli('C51'),
  C52: {
    neg: [
      c52({ file: docs({ 'privacy-policy.html': null }) }),
      c52({
        file: docs({
          'src/locales/en.ts': 'appName: "Rise Against Hunger Italia"',
        }),
      }),
      c52({
        file: docs({
          'docs/store/google-play/scheda.md': 'Rise Against Hunger Italia Ets',
        }),
      }),
      c52({
        file: docs({
          'docs/store/google-play/rilascio.md': `${NOME_LEGALE}\nesenti (ONLUS/ETS)`,
        }),
      }),
      c52({
        file: docs({
          'privacy-policy-en.html': `${NOME_LEGALE}\nRise Against Hunger Italia Onlus`,
        }),
      }),
      c52({ appName: { it: NOME_LEGALE } }),
      c52({ appName: { it: null } }),
    ],
    pos: [c52({})],
  },
};
