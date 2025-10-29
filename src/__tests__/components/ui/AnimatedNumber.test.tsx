import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedNumber from '../../../components/ui/AnimatedNumber';

describe('AnimatedNumber', () => {
  it('should render with initial value', () => {
    const { root } = render(<AnimatedNumber value={100} />);
    expect(root).toBeTruthy();
  });

  it('should handle zero value', () => {
    const { root } = render(<AnimatedNumber value={0} />);
    expect(root).toBeTruthy();
  });

  it('should handle large numbers', () => {
    const { root } = render(<AnimatedNumber value={999999} />);
    expect(root).toBeTruthy();
  });

  it('should be a valid component', () => {
    expect(AnimatedNumber).toBeDefined();
  });
});
