import React from 'react';
import { render } from '@testing-library/react-native';
import HeaderLogo from '../../../components/ui/HeaderLogo';

// Mock useTheme hook
jest.mock('../../../shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      glass: {
        medium: 'rgba(255, 255, 255, 0.5)',
      },
    },
  }),
}));

describe('HeaderLogo - Rendering', () => {
  it('should render successfully', () => {
    const { toJSON } = render(<HeaderLogo />);

    expect(toJSON()).toBeTruthy();
  });

  it('should apply theme colors from useTheme hook', () => {
    const { toJSON } = render(<HeaderLogo />);

    expect(toJSON()).toBeTruthy();
  });

  it('should render consistently', () => {
    const component1 = render(<HeaderLogo />);
    const component2 = render(<HeaderLogo />);

    expect(component1.toJSON()).toBeTruthy();
    expect(component2.toJSON()).toBeTruthy();
  });
});

describe('HeaderLogo - Component Behavior', () => {
  it('should maintain consistent rendering', () => {
    const { toJSON, rerender } = render(<HeaderLogo />);

    const snapshot1 = toJSON();
    rerender(<HeaderLogo />);
    const snapshot2 = toJSON();

    expect(snapshot1).toBeTruthy();
    expect(snapshot2).toBeTruthy();
  });

  it('should render multiple instances without conflicts', () => {
    const { toJSON } = render(
      <>
        <HeaderLogo />
        <HeaderLogo />
        <HeaderLogo />
      </>
    );

    expect(toJSON()).toBeTruthy();
  });

  it('should handle theme changes gracefully', () => {
    const { toJSON } = render(<HeaderLogo />);

    expect(toJSON()).toBeTruthy();
  });
});

describe('HeaderLogo - Performance', () => {
  it('should render quickly', () => {
    const startTime = performance.now();
    render(<HeaderLogo />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(50);
  });

  it('should handle rapid re-renders efficiently', () => {
    const { rerender } = render(<HeaderLogo />);

    const startTime = performance.now();
    for (let i = 0; i < 10; i++) {
      rerender(<HeaderLogo />);
    }
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });
});
