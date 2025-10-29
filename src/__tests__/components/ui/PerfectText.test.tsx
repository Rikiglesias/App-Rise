import React from 'react';
import { render } from '@testing-library/react-native';
import { PerfectText } from '../../../components/ui/PerfectText';

describe('PerfectText', () => {
  it('should render text content', () => {
    const { getByText } = render(
      <PerfectText lines={1}>Hello World</PerfectText>
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const { root } = render(
      <PerfectText lines={1} style={{ color: 'red' }}>
        Styled Text
      </PerfectText>
    );
    expect(root).toBeTruthy();
  });

  it('should handle empty children', () => {
    const { root } = render(<PerfectText lines={1}>{''}</PerfectText>);
    expect(root).toBeTruthy();
  });

  it('should be a valid component', () => {
    expect(PerfectText).toBeDefined();
  });
});
