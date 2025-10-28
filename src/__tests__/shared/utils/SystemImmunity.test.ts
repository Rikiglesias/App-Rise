import { PixelRatio } from 'react-native';
import {
  getSystemFontSettings,
  getImmuneTextProps,
  getImmuneDimensions,
  generateImmunityReport,
} from '../../../shared/utils/SystemImmunity';

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

  it('getImmuneDimensions normalizes sizes by reference pixel ratio', () => {
    // reference ratio is 3.0 in implementation
    pixelGetSpy.mockReturnValue(2);
    const size = getImmuneDimensions(12);
    // normalized from 2 -> 3 (12 * 3 / 2 = 18)
    expect(size).toBe(18);
  });

  it('generateImmunityReport summarizes configuration and state', () => {
    const report = generateImmunityReport();
    expect(report.title).toContain('REPORT IMMUNIT');
    // Validate structure and key booleans without relying on RN defaults
    expect(typeof report.currentState.fontScale).toBe('number');
    expect(report.immuneProps.allowFontScaling).toBe(false);
    expect(report.finalStatus.isFullyImmune).toBe(true);
  });
});
