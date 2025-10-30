import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Animations,
} from '../../../shared/constants/designTokens';

describe('Design Tokens - Colors', () => {
  it('should have primary color palette', () => {
    expect(Colors.primary).toBeDefined();
    expect(Colors.primary[500]).toBe('#DC2626');
    expect(Colors.primary[50]).toBeDefined();
    expect(Colors.primary[100]).toBeDefined();
    expect(Colors.primary[900]).toBeDefined();
  });

  it('should have neutral color palette', () => {
    expect(Colors.neutral).toBeDefined();
    expect(Colors.neutral[0]).toBe('#FFFFFF');
    expect(Colors.neutral[900]).toBe('#171717');
    expect(Colors.neutral[50]).toBeDefined();
  });

  it('should have semantic colors', () => {
    expect(Colors.semantic).toBeDefined();
    expect(Colors.semantic.success).toBeDefined();
    expect(Colors.semantic.warning).toBeDefined();
    expect(Colors.semantic.error).toBeDefined();
    expect(Colors.semantic.info).toBeDefined();
  });

  it('should have glass colors', () => {
    expect(Colors.glass).toBeDefined();
    expect(Colors.glass.light).toBeDefined();
    expect(Colors.glass.medium).toBeDefined();
    expect(Colors.glass.dark).toBeDefined();
  });

  it('should have black colors', () => {
    expect(Colors.black).toBeDefined();
    expect(Colors.black.pure).toBe('#000000');
    expect(Colors.black.dark).toBeDefined();
    expect(Colors.black.medium).toBeDefined();
  });
});

describe('Design Tokens - Typography', () => {
  it('should have font families', () => {
    expect(Typography.families).toBeDefined();
    expect(typeof Typography.families.heading).toBe('string');
    expect(typeof Typography.families.body).toBe('string');
    expect(typeof Typography.families.accent).toBe('string');
    // Ensure we are not using Inter anymore
    expect(Typography.families.heading).not.toMatch(/^Inter_/);
    expect(Typography.families.body).not.toMatch(/^Inter_/);
    expect(Typography.families.accent).not.toMatch(/^Inter_/);
    expect(typeof Typography.families.mono).toBe('string');
    expect(Typography.families.mono.length).toBeGreaterThan(0);
  });

  it('should have font sizes', () => {
    expect(Typography.sizes).toBeDefined();
    // Values are now responsive scaled, test actual computed values
    expect(typeof Typography.sizes.xs).toBe('number');
    expect(typeof Typography.sizes.sm).toBe('number');
    expect(typeof Typography.sizes.base).toBe('number');
    expect(typeof Typography.sizes.lg).toBe('number');
    expect(typeof Typography.sizes.xl).toBe('number');
    // Ensure sizes are in correct relative order
    expect(Typography.sizes.xs).toBeLessThan(Typography.sizes.sm);
    expect(Typography.sizes.sm).toBeLessThan(Typography.sizes.base);
    expect(Typography.sizes.base).toBeLessThan(Typography.sizes.lg);
  });

  it('should have font weights', () => {
    expect(Typography.weights).toBeDefined();
    expect(Typography.weights.light).toBe('300');
    expect(Typography.weights.regular).toBe('400');
    expect(Typography.weights.medium).toBe('500');
    expect(Typography.weights.bold).toBe('700');
  });

  it('should have line heights', () => {
    expect(Typography.lineHeights).toBeDefined();
    expect(typeof Typography.lineHeights.tight).toBe('number');
    expect(typeof Typography.lineHeights.normal).toBe('number');
    expect(typeof Typography.lineHeights.relaxed).toBe('number');
    expect(Typography.lineHeights.tight).toBeLessThan(
      Typography.lineHeights.normal
    );
    expect(Typography.lineHeights.normal).toBeLessThan(
      Typography.lineHeights.relaxed
    );
  });
});

describe('Design Tokens - Spacing', () => {
  it('should have spacing scale', () => {
    expect(Spacing).toBeDefined();
    expect(Spacing[0]).toBe(0); // Zero should always be zero
    // Values are now responsive scaled, test types and relative order
    expect(typeof Spacing[1]).toBe('number');
    expect(typeof Spacing[2]).toBe('number');
    expect(typeof Spacing[4]).toBe('number');
    expect(typeof Spacing[8]).toBe('number');
    // Ensure spacing increases correctly
    expect(Spacing[1]).toBeLessThan(Spacing[2]);
    expect(Spacing[2]).toBeLessThan(Spacing[4]);
    expect(Spacing[4]).toBeLessThan(Spacing[8]);
  });

  it('should be numeric values', () => {
    Object.values(Spacing).forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Design Tokens - Border Radius', () => {
  it('should have border radius scale', () => {
    expect(BorderRadius).toBeDefined();
    expect(BorderRadius.none).toBe(0); // Zero should always be zero
    expect(BorderRadius.full).toBe(9999); // Full should always be 9999
    // Values are now responsive scaled, test types and relative order
    expect(typeof BorderRadius.sm).toBe('number');
    expect(typeof BorderRadius.md).toBe('number');
    expect(typeof BorderRadius.lg).toBe('number');
    expect(typeof BorderRadius.xl).toBe('number');
    // Ensure border radius increases correctly
    expect(BorderRadius.sm).toBeLessThan(BorderRadius.md);
    expect(BorderRadius.md).toBeLessThan(BorderRadius.lg);
    expect(BorderRadius.lg).toBeLessThan(BorderRadius.xl);
  });

  it('should be numeric values', () => {
    const numericValues = [
      BorderRadius.none,
      BorderRadius.sm,
      BorderRadius.md,
      BorderRadius.lg,
      BorderRadius.xl,
    ];

    numericValues.forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Design Tokens - Shadows', () => {
  it('should have shadow definitions', () => {
    expect(Shadows).toBeDefined();
    expect(Shadows.none).toBeDefined();
    expect(Shadows.sm).toBeDefined();
    expect(Shadows.md).toBeDefined();
    expect(Shadows.lg).toBeDefined();
    // xs e xl rimossi - non esistono più
  });

  it('should have shadow properties', () => {
    const shadow = Shadows.md;
    expect(shadow.shadowColor).toBeDefined();
    expect(shadow.shadowOffset).toBeDefined();
    expect(shadow.shadowOpacity).toBeDefined();
    expect(shadow.shadowRadius).toBeDefined();
    expect(shadow.elevation).toBeDefined();
  });

  it('should have primary shadow', () => {
    expect(Shadows.primary).toBeDefined();
    expect(Shadows.primary.shadowColor).toBe('#DC2626');
  });
});

describe('Design Tokens - Animations', () => {
  it('should have animation timing', () => {
    expect(Animations).toBeDefined();
    expect(Animations.timing).toBeDefined();
    expect(Animations.timing.fast).toBe(150);
    expect(Animations.timing.normal).toBe(250);
    expect(Animations.timing.slow).toBe(350);
  });

  it('should have animation durations', () => {
    expect(Animations.duration).toBeDefined();
    expect(Animations.duration.ultraFast).toBe(100);
    expect(Animations.duration.fast).toBe(150);
    expect(Animations.duration.normal).toBe(250);
  });

  it('should have spring configurations', () => {
    expect(Animations.spring).toBeDefined();
    expect(Animations.spring.damping).toBe(15);
    expect(Animations.spring.stiffness).toBe(150);
    expect(Animations.spring.gentle).toBeDefined();
  });
});

describe('Design Tokens - Consistency', () => {
  it('should have consistent color format for primary palette', () => {
    Object.values(Colors.primary).forEach(color => {
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should have consistent color format for neutral palette', () => {
    Object.values(Colors.neutral).forEach(color => {
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should have consistent typography scales', () => {
    const fontSizes = Object.values(Typography.sizes);
    fontSizes.forEach(size => {
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  it('should have consistent shadow elevations', () => {
    const shadows = [Shadows.none, Shadows.sm, Shadows.md, Shadows.lg];
    shadows.forEach(shadow => {
      expect(typeof shadow.elevation).toBe('number');
      expect(shadow.elevation).toBeGreaterThanOrEqual(0); // none ha elevation 0
    });
  });
});
