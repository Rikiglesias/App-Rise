import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ModernSmartTitle } from '@/features/home/components/ModernSmartTitle';

describe('ModernSmartTitle', () => {
  it('renderizza titolo e logo', () => {
    const anim = new Animated.Value(1);
    render(
      <ModernSmartTitle
        titleAnim={anim}
        titleOpacity={anim as unknown as Animated.AnimatedInterpolation<number>}
        titleTransform={anim as unknown as Animated.AnimatedInterpolation<number>}
      />
    );

    expect(screen.getByText(/Rise Against/i)).toBeTruthy();
    expect(screen.getByText(/Hunger/i)).toBeTruthy();
    expect(screen.getByText(/Italia/i)).toBeTruthy();
    expect(screen.getByLabelText('Logo Rise Against Hunger')).toBeTruthy();
  });
});
