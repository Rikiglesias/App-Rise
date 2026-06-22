import { PixelRatio } from 'react-native';
import {
  getSystemFontSettings,
  getImmuneTextProps,
} from '../../../shared/utils/SystemImmunity';

// I test per getImmuneDimensions/generateImmunityReport (funzioni debug rimosse) restano commentati sotto;
// i due test attivi coprono getSystemFontSettings e getImmuneTextProps (tuttora esistenti).
describe('SystemImmunity utilities', () => {
  const pixelGetSpy = jest.spyOn(PixelRatio, 'get');
  const fontScaleSpy = jest.spyOn(PixelRatio, 'getFontScale');

  beforeEach(() => {
    pixelGetSpy.mockReturnValue(3); // default current device ratio
    fontScaleSpy.mockReturnValue(1.2); // simulate user-scaled font
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getSystemFontSettings reports font scale and immunity state', () => {
    const settings = getSystemFontSettings();
    expect(settings.fontScale).toBe(1.2);
    expect(settings.isUserScaled).toBe(true);
    expect(settings.immuneFontScale).toBe(1.0);
    expect(typeof settings.platform).toBe('string');
  });

  it('getImmuneTextProps disables system font scaling', () => {
    const props = getImmuneTextProps();
    expect(props.allowFontScaling).toBe(false);
    expect(props.maxFontSizeMultiplier).toBe(1.0);
  });

  // Test rimossi: funzioni debug getImmuneDimensions e generateImmunityReport non più disponibili
  // it('getImmuneDimensions normalizes sizes by reference pixel ratio', () => {
  //   pixelGetSpy.mockReturnValue(2);
  //   const size = getImmuneDimensions(12);
  //   expect(size).toBe(18);
  // });

  // it('generateImmunityReport summarizes configuration and state', () => {
  //   const report = generateImmunityReport();
  //   expect(report.title).toContain('REPORT IMMUNIT');
  //   expect(report.immuneProps.allowFontScaling).toBe(false);
  // });
});
