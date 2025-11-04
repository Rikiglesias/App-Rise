import * as UT from '../../../shared/theme/UniversalTheme';

describe('UniversalTheme debug', () => {
  it('exports functions as expected', () => {
    expect(typeof UT.getThemeColor).toBe('function');
    expect(typeof UT.useUniversalTheme).toBe('function');
    // Print keys for manual inspection if needed
    // eslint-disable-next-line no-console
    console.log('UT keys:', Object.keys(UT));
  });
});

