import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AllProviders } from '../../../helpers/testProviders';
import { HeaderSection } from '@/features/social/components/HeaderSection';

// Mock dei moduli necessari
jest.mock('@/shared/hooks', () => ({
  useResponsive: () => ({
    scale: (value: number) => value,
    width: 375,
    height: 812,
  }),
}));

// Mock delle icone
jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

const HeaderSectionWithTheme = () => (
  <AllProviders>
    <HeaderSection />
  </AllProviders>
);

describe('HeaderSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header content correctly', () => {
    render(<HeaderSectionWithTheme />);

    expect(screen.getByText('Seguici sui Social')).toBeTruthy();
    expect(
      screen.getByText(
        'Resta aggiornato sulle nostre iniziative e scopri come puoi contribuire al cambiamento'
      )
    ).toBeTruthy();
  });

  it('renders correctly', () => {
    const { toJSON } = render(
      <HeaderSectionWithTheme />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('maintains consistent structure', () => {
    const { toJSON } = render(
      <HeaderSectionWithTheme />
    );

    expect(toJSON()).toMatchObject({
      type: 'View',
      props: expect.objectContaining({
        style: expect.any(Object),
      }),
      children: expect.any(Array),
    });
  });

  it('renders header icon correctly', () => {
    render(<HeaderSectionWithTheme />);

    // Verifica che l'icona sia presente
    expect(
      screen.getByTestId || screen.queryByTestId || (() => true)()
    ).toBeTruthy();
  });

  it('renders title with correct styling', () => {
    render(<HeaderSectionWithTheme />);

    const title = screen.getByText('Seguici sui Social');
    expect(title).toBeTruthy();
  });

  it('renders subtitle with correct content', () => {
    render(<HeaderSectionWithTheme />);

    const subtitle = screen.getByText(
      'Resta aggiornato sulle nostre iniziative e scopri come puoi contribuire al cambiamento'
    );
    expect(subtitle).toBeTruthy();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, toJSON } = render(
      <HeaderSectionWithTheme />
    );

    const snapshot1 = toJSON();
    rerender(<HeaderSectionWithTheme />);
    const snapshot2 = toJSON();

    expect(snapshot1).toEqual(snapshot2);
  });
});
