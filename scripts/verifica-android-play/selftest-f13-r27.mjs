// C22 per i criteri R27-R29 a titoli Jest (f13-r27.mjs) e per gli statici sul codice (C93 C94 C98): ogni
// fixture negativa è il positivo con UNA mutazione; gli statici ricevono testi interi, così il selftest prova
// anche il parsing. I criteri sui documenti (C86 C91 C92 C96 C99) stanno in selftest-f13-r27-testi.mjs.
import { DEFINIZIONI_R27 } from './f13-r27.mjs';
import { CAMPI_C93, ESENTI_C94, SFONDI_C94 } from './f13-r27-codice.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';

const v = (id, statico = null) => verde(id, statico, DEFINIZIONI_R27);
const n = (id, statico = null) => negativiComuni(id, statico, DEFINIZIONI_R27);
const soloTitoli = id => ({ neg: n(id), pos: [v(id)] });
export const conStatico = (id, ok, mutazioni, positivi = []) => ({
  neg: [...n(id, ok), ...mutazioni.map(m => v(id, { ...ok, ...m }))],
  pos: [v(id, ok), ...positivi.map(m => v(id, { ...ok, ...m }))],
});

// --- C93 ---
const CAMPO =
  'export const C = ({ error }) => (\n  <View>\n    {error ? (\n      <View accessibilityRole="alert">\n        <PerfectText>{error}</PerfectText>\n      </View>\n    ) : null}\n  </View>\n);';
const INPUT = [
  'useEffect(() => {',
  "  if (!error && hint && hintTone !== 'neutral') AccessibilityInfo.announceForAccessibility(hint);",
  '}, [error, hint, hintTone]);',
  'return (',
  '  <View>',
  '    {error ? (',
  '      <View accessibilityRole="alert"><PerfectText>{error}</PerfectText></View>',
  '    ) : hint ? (',
  '      <View><PerfectText style={styles[hintTone]}>{hint}</PerfectText></View>',
  '    ) : null}',
  '  </View>',
  ');',
].join('\n');
const campi = (mut = {}) => ({
  file: {
    ...Object.fromEntries(Object.values(CAMPI_C93).map(f => [f, CAMPO])),
    [CAMPI_C93.AuthInput]: INPUT,
    ...mut,
  },
});

// --- C94 ---
const SPENTO = 'accessible={false} focusable={false}';
const STORIA = `<Modal>\n  <View style={s.overlay}>\n    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} ${SPENTO} />\n    <View><PlatformTouchable onPress={handleClose} accessibilityLabel="Chiudi" /></View>\n  </View>\n</Modal>`;
const avvolge = (stile, chiudi) =>
  `<Modal>\n  <PlatformTouchable style={[${stile}, overlayInsets]} onPress={${chiudi}} activeOpacity={1} ${SPENTO}>\n    <PlatformTouchable activeOpacity={1} ${SPENTO}>\n      <Contenuto onPress={() => fai(x => x > 1)} />\n    </PlatformTouchable>\n  </PlatformTouchable>\n</Modal>`;
const [F_STORIA, F_DONARE, F_PARTNER] = Object.values(SFONDI_C94);
const C94_OK = {
  file: {
    [F_STORIA]: STORIA,
    [F_DONARE]: avvolge('modalStyles.modalOverlay', 'handleClose'),
    [F_PARTNER]: avvolge('styles.overlay', 'handleCancel'),
  },
  toccabile:
    '...(props.accessible !== undefined && { accessible: props.accessible }),\n...(props.focusable !== undefined && { focusable: props.focusable }),',
  esenti: Object.fromEntries(ESENTI_C94.map(f => [f, true])),
};
const sfondi = mut => ({ file: { ...C94_OK.file, ...mut } });

// --- C98 ---
const CHIAVE =
  "storageKey: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`,";
const client = riga =>
  `export const supabase = createClient(supabaseUrl, supabaseAnonKey, {\n  auth: {\n    storage: authStorage,\n    ${riga}\n    persistSession: true,\n  },\n});`;

export const FIXTURE_F13_R27 = {
  ...Object.fromEntries(
    ['C85', 'C87', 'C88', 'C89', 'C90', 'C95', 'C97'].map(id => [
      id,
      soloTitoli(id),
    ])
  ),
  C93: conStatico('C93', campi(), [
    campi({ [CAMPI_C93.AuthPhoneField]: null }),
    // ramo dell'errore con la live region (AuthInput oggi, :154-155)
    campi({
      [CAMPI_C93.AuthInput]: INPUT.replace(
        '<View accessibilityRole="alert">',
        '<View accessibilityLiveRegion="assertive" accessibilityRole="alert">'
      ),
    }),
    campi({
      [CAMPI_C93.AuthCityField]: CAMPO.replace(
        '<View accessibilityRole="alert">',
        '<View accessibilityLiveRegion="polite">'
      ),
    }),
    // il campo annuncia da sé l'errore (AuthInput oggi, :87-89)
    campi({
      [CAMPI_C93.AuthDateField]: `useEffect(() => { if (error) AccessibilityInfo.announceForAccessibility(error); }, [error]);\n${CAMPO}`,
    }),
    campi({
      [CAMPI_C93.AuthConsentCheckbox]: CAMPO.replace(
        '{error ? (',
        '{error && ('
      ),
    }),
    // suggerimento con la live region (coppia vietata da R26)
    campi({
      [CAMPI_C93.AuthInput]: INPUT.replace(
        '<View><PerfectText style',
        '<View accessibilityLiveRegion="polite"><PerfectText style'
      ),
    }),
    // suggerimento non più annunciato
    campi({
      [CAMPI_C93.AuthInput]: INPUT.replace(
        'AccessibilityInfo.announceForAccessibility(hint);',
        ''
      ),
    }),
  ]),
  C94: conStatico(
    'C94',
    C94_OK,
    [
      sfondi({ [F_STORIA]: null }),
      sfondi({ [F_STORIA]: STORIA.replace(' focusable={false}', '') }),
      sfondi({ [F_STORIA]: STORIA.replace('accessible={false} ', '') }),
      // toccabile interno ancora accessibile
      sfondi({
        [F_DONARE]: C94_OK.file[F_DONARE].replace(
          `activeOpacity={1} ${SPENTO}>\n      <Contenuto`,
          'activeOpacity={1}>\n      <Contenuto'
        ),
      }),
      sfondi({
        [F_PARTNER]: C94_OK.file[F_PARTNER].replace(
          SPENTO,
          `${SPENTO} importantForAccessibility="no-hide-descendants"`
        ),
      }),
      sfondi({
        [F_PARTNER]: C94_OK.file[F_PARTNER].replace(
          SPENTO,
          `${SPENTO} accessibilityElementsHidden`
        ),
      }),
      // sfondo non trovato
      sfondi({
        [F_DONARE]: C94_OK.file[F_DONARE].replace(
          '[modalStyles.modalOverlay, overlayInsets]',
          '[s.scheda]'
        ),
      }),
      // PlatformTouchable che non passa focusable al nativo su Android
      { toccabile: C94_OK.toccabile.split('\n')[0] },
      { esenti: { ...C94_OK.esenti, [ESENTI_C94[0]]: false } },
    ],
    [
      // sfondo fratello (non avvolge) fatto con Pressable: niente toccabile interno né PlatformTouchable
      {
        file: {
          [F_STORIA]: STORIA,
          [F_DONARE]: STORIA,
          [F_PARTNER]: STORIA.replace('handleClose', 'handleCancel'),
        },
        toccabile: '',
      },
    ]
  ),
  C98: conStatico(
    'C98',
    { testo: client(CHIAVE) },
    [
      { testo: null },
      { testo: client('') },
      { testo: client("storageKey: 'rah-session',") },
      { testo: client('storageKey: CHIAVE_SESSIONE,') },
      {
        testo: client(CHIAVE.replace('[0]', '[1]')),
      },
    ],
    [
      {
        testo: `const CHIAVE_SESSIONE = \`sb-\${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token\`;\n${client('storageKey: CHIAVE_SESSIONE,')}`,
      },
    ]
  ),
};
