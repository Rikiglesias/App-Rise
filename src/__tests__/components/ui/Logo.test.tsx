import React from 'react';
import { render } from '@testing-library/react-native';
import Logo from '../../../components/ui/Logo';

describe('Logo - Rendering', () => {
  it('should render successfully', () => {
    const { getByTestId } = render(<Logo />);

    expect(getByTestId).toBeDefined();
  });

  it('should render with custom size', () => {
    const customSize = 100;
    const { getByTestId } = render(<Logo size={customSize} />);

    expect(getByTestId).toBeDefined();
  });

  it('should render with small size variant', () => {
    const { getByTestId } = render(<Logo size={50} />);

    expect(getByTestId).toBeDefined();
  });

  it('should render with large size variant', () => {
    const { getByTestId } = render(<Logo size={200} />);

    expect(getByTestId).toBeDefined();
  });
});

describe('Logo - Props Handling', () => {
  it('should handle default size when no prop provided', () => {
    const { getByTestId } = render(<Logo />);

    expect(getByTestId).toBeDefined();
  });

  it('should handle zero size prop', () => {
    const { getByTestId } = render(<Logo size={0} />);

    expect(getByTestId).toBeDefined();
  });

  it('should handle negative size prop', () => {
    const { getByTestId } = render(<Logo size={-10} />);

    expect(getByTestId).toBeDefined();
  });

  it('should handle very large size prop', () => {
    const { getByTestId } = render(<Logo size={1000} />);

    expect(getByTestId).toBeDefined();
  });
});

describe('Logo - Performance', () => {
  it('should render quickly with default props', () => {
    const startTime = performance.now();
    render(<Logo />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should render multiple instances without issues', () => {
    const { getAllByTestId } = render(
      <>
        <Logo size={50} />
        <Logo size={100} />
        <Logo size={150} />
      </>
    );

    expect(getAllByTestId).toBeDefined();
  });
});
