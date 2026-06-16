import { Colors } from '../../../shared/constants/designTokens';
import {
  getAdaptiveColors,
  type ThemeColors,
} from '../../../shared/theme/adaptiveColors';

describe('getAdaptiveColors — design tokens dark-aware', () => {
  it('light ritorna i Colors esatti (zero regressione light)', () => {
    const light: ThemeColors = getAdaptiveColors(false);
    // stessa reference: in light nulla cambia rispetto a oggi
    expect(light).toBe(Colors);
  });

  it('dark: scala neutral invertita (sfondo chiaro→scuro, testo scuro→chiaro)', () => {
    const dark = getAdaptiveColors(true);
    expect(Colors.neutral[0]).toBe('#FFFFFF');
    expect(dark.neutral[0]).toBe('#0C0C0E');
    expect(Colors.neutral[900]).toBe('#171717');
    expect(dark.neutral[900]).toBe('#F5F5F5');
    // mid-scale resta neutro identico
    expect(dark.neutral[500]).toBe(Colors.neutral[500]);
  });

  it('dark: brand invariato (il rosso Rise resta su scuro)', () => {
    const dark = getAdaptiveColors(true);
    expect(dark.primary).toEqual(Colors.primary);
    expect(dark.primary[500]).toBe('#DC2626');
    expect(dark.gradients).toEqual(Colors.gradients);
    expect(dark.semantic).toEqual(Colors.semantic);
  });

  it('dark: nessun ruolo neutral perso (stesse chiavi di Colors)', () => {
    const dark = getAdaptiveColors(true);
    expect(Object.keys(dark.neutral).sort()).toEqual(
      Object.keys(Colors.neutral).sort()
    );
  });

  it('dark: glass adattato (overlay più morbido su superfici scure)', () => {
    const dark = getAdaptiveColors(true);
    expect(dark.glass).not.toEqual(Colors.glass);
    expect(dark.glass.medium).toBe('rgba(255, 255, 255, 0.12)');
  });
});
