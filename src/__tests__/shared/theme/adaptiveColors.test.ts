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
    // Il grigio medio fa da testo terziario e segnaposto: in scuro è più chiaro (C50).
    expect(dark.neutral[500]).toBe('#8E8E93');
  });

  it('dark: brand invariato (il rosso Rise resta su scuro)', () => {
    const dark = getAdaptiveColors(true);
    expect(dark.primary).toEqual(Colors.primary);
    expect(dark.primary[500]).toBe('#DC2626');
    expect(dark.gradients).toEqual(Colors.gradients);
    expect(dark.semantic.error.main).toBe(Colors.semantic.error.main);
    expect(dark.semantic.success.main).toBe(Colors.semantic.success.main);
    expect(dark.semantic.warning.main).toBe(Colors.semantic.warning.main);
    expect(dark.semantic.info).toEqual(Colors.semantic.info);
  });

  it('dark: i colori semantici da testo cambiano per stare sul fondo scuro', () => {
    const dark = getAdaptiveColors(true);
    expect(dark.semantic.error.text).toBe('#F87171');
    expect(dark.semantic.success.text).toBe(Colors.semantic.success.main);
    expect(Colors.semantic.success.text).toBe('#047857');
    expect(dark.semantic.warning.text).toBe(Colors.semantic.warning.main);
    expect(Colors.semantic.warning.text).toBe('#92400E');
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
