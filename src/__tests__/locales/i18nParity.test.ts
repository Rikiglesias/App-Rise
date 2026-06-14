/**
 * i18n PARITY GUARD
 * Verifica che le traduzioni IT ed EN abbiano ESATTAMENTE le stesse chiavi.
 * Previene il ri-presentarsi di chiavi orfane (presenti in una lingua e non
 * nell'altra), che a runtime causerebbero fallback silenziosi o chiavi nude.
 */
// Alias per evitare lo shadowing della funzione `it()` di jest.
import itTranslations from '../../locales/it';
import enTranslations from '../../locales/en';

type Tree = { [key: string]: string | Tree };

const collectKeys = (obj: Tree, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? collectKeys(value, path)
      : [path];
  });

describe('i18n parity (it <-> en)', () => {
  const itKeys = collectKeys(itTranslations as Tree).sort();
  const enKeys = collectKeys(enTranslations as Tree).sort();

  it('it and en expose identical translation keys', () => {
    const missingInEn = itKeys.filter(k => !enKeys.includes(k));
    const missingInIt = enKeys.filter(k => !itKeys.includes(k));

    expect({ missingInEn, missingInIt }).toEqual({
      missingInEn: [],
      missingInIt: [],
    });
  });
});
