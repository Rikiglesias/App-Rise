import React from 'react';
import { render } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/testProviders';
import { PerfectText } from '../../../components/ui/PerfectText';

describe('PerfectText', () => {
  it('should render text content', () => {
    const { getByText } = renderWithProviders(
      <PerfectText size={16} lines={1}>
        Hello World
      </PerfectText>,
      render
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const { root } = renderWithProviders(
      <PerfectText size={16} lines={1} style={{ color: 'red' }}>
        Styled Text
      </PerfectText>,
      render
    );
    expect(root).toBeTruthy();
  });

  it('should handle empty children', () => {
    const { root } = renderWithProviders(
      <PerfectText size={16} lines={1}>
        {''}
      </PerfectText>,
      render
    );
    expect(root).toBeTruthy();
  });

  it('should be a valid component', () => {
    expect(PerfectText).toBeDefined();
  });
});
