import { changeLanguage, getCurrentLocale } from '@/locales';
import { LOCATIONS_DATA } from '@/features/impact/data/locationsData';
import { getModalData } from '@/features/impact/data/mapModalData';
import { resolveLocalizedText } from '@/features/impact/utils/localizedText';
import type { LocalizedText } from '@/features/impact/utils/localizedText';
import { convertToMapLocations } from '@/features/impact/utils/mapHelpers';

describe('contenuti impact bilingui', () => {
  let originalLocale: ReturnType<typeof getCurrentLocale>;

  beforeEach(() => {
    originalLocale = getCurrentLocale();
  });

  afterEach(() => {
    changeLanguage(originalLocale);
  });

  it('risolve la lingua a ogni chiamata senza congelarla all’import', () => {
    const text: LocalizedText = { it: 'Italia', en: 'Italy' };
    changeLanguage('it');
    expect(resolveLocalizedText(text)).toBe('Italia');
    changeLanguage('en');
    expect(resolveLocalizedText(text)).toBe('Italy');
    changeLanguage('it');
    expect(resolveLocalizedText(text)).toBe('Italia');
  });

  it.each(LOCATIONS_DATA)(
    'localizza tutti i campi della scheda $id',
    location => {
      changeLanguage('it');
      const italian = getModalData(location.id);
      changeLanguage('en');
      const english = getModalData(location.id);

      expect(italian).toMatchObject({
        title: location.name,
        description: location.description.it,
        program: location.program.it,
        achievements: location.achievements.map(text => text.it),
        stats: location.stats,
        year: location.year,
      });
      expect(english).toMatchObject({
        title: location.name,
        description: location.description.en,
        program: location.program.en,
        achievements: location.achievements.map(text => text.en),
        stats: location.stats,
        year: location.year,
      });
      expect(italian?.subtitle).toContain(location.country.it);
      expect(english?.subtitle).toContain(location.country.en);
    }
  );

  it('traduce i suffissi delle sedi e dell’emergenza', () => {
    changeLanguage('en');
    expect(getModalData('italy')?.subtitle).toBe('Italy - European Office');
    expect(getModalData('usa')?.subtitle).toBe(
      'United States - Global Headquarters'
    );
    expect(getModalData('ukraine')?.subtitle).toBe(
      'Ukraine - Humanitarian Emergency'
    );
    changeLanguage('it');
    expect(getModalData('italy')?.subtitle).toBe('Italia - Sede Europea');
    expect(getModalData('usa')?.subtitle).toBe('Stati Uniti - Sede Globale');
    expect(getModalData('ukraine')?.subtitle).toBe(
      'Ucraina - Emergenza Umanitaria'
    );
  });

  it.each(['unknown-location', 'constructor', '__proto__'])(
    'restituisce null per l’ID non presente %s',
    id => {
      expect(getModalData(id)).toBeNull();
    }
  );

  it('localizza i dati della mappa dopo il cambio lingua preservando la geografia', () => {
    changeLanguage('it');
    const italian = convertToMapLocations();
    changeLanguage('en');
    const english = convertToMapLocations();

    expect(italian.map(location => location.country)).toEqual([
      'Zimbabwe',
      'Sud Africa',
      'Italia',
      'Stati Uniti',
      'Ucraina',
      'Somalia',
    ]);
    expect(english.map(location => location.country)).toEqual([
      'Zimbabwe',
      'South Africa',
      'Italy',
      'United States',
      'Ukraine',
      'Somalia',
    ]);
    expect(english.map(location => location.coordinates)).toEqual(
      italian.map(location => location.coordinates)
    );
    expect(english.map(location => location.description)).toEqual(
      LOCATIONS_DATA.map(location => location.description.en)
    );
  });

  it('fornisce testi it/en non vuoti per le località', () => {
    const texts: LocalizedText[] = [
      ...LOCATIONS_DATA.flatMap(location => [
        location.country,
        location.description,
        location.program,
        ...location.achievements,
      ]),
    ];
    for (const text of texts) {
      expect(Object.keys(text).sort()).toEqual(['en', 'it']);
      expect(text.it.trim()).not.toBe('');
      expect(text.en.trim()).not.toBe('');
    }
  });

  it('preserva i valori numerici delle località', () => {
    expect(LOCATIONS_DATA.map(location => location.stats)).toEqual([
      { meals: 850000, beneficiaries: 3200, schools: 5 },
      { meals: 57400000, beneficiaries: 3600000 },
      { meals: 3136968, kits: 16321, beneficiaries: 13323 },
      { meals: 365000000, beneficiaries: 74 },
      { meals: 250000, kits: 5000, beneficiaries: 15000 },
      { meals: 180000, beneficiaries: 8500 },
    ]);
  });
});
