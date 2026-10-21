import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PlatformTouchable from '../../../components/ui/PlatformTouchable';

type RenderedNode = ReturnType<ReturnType<typeof render>['getByText']>;

describe('PlatformTouchable - Rendering', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress}>
        <Text>Test Content</Text>
      </PlatformTouchable>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should render without onPress', () => {
    const { getByText } = render(
      <PlatformTouchable>
        <Text>Test Content</Text>
      </PlatformTouchable>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

describe('PlatformTouchable - Interactions', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress}>
        <Text>Pressable</Text>
      </PlatformTouchable>
    );

    fireEvent.press(getByText('Pressable'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should support activeOpacity prop', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress} activeOpacity={0.7}>
        <Text>Pressable</Text>
      </PlatformTouchable>
    );

    expect(getByText('Pressable')).toBeTruthy();
  });

  it('should support style prop', () => {
    const testStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress} style={testStyle}>
        <Text>Styled</Text>
      </PlatformTouchable>
    );

    expect(getByText('Styled')).toBeTruthy();
  });
});

describe('PlatformTouchable - Accessibility', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should support accessibility props', () => {
    const { getByLabelText } = render(
      <PlatformTouchable
        onPress={mockOnPress}
        accessibilityLabel="Test Button"
        accessibilityRole="button"
      >
        <Text>Button</Text>
      </PlatformTouchable>
    );

    expect(getByLabelText('Test Button')).toBeTruthy();
  });

  it('should support accessibility state', () => {
    const { getByText } = render(
      <PlatformTouchable
        onPress={mockOnPress}
        accessibilityState={{ disabled: false }}
      >
        <Text>Button</Text>
      </PlatformTouchable>
    );

    expect(getByText('Button')).toBeTruthy();
  });
});

describe('PlatformTouchable - Edge Cases', () => {
  it('should handle multiple children', () => {
    const { getByText } = render(
      <PlatformTouchable>
        <Text>First</Text>
        <Text>Second</Text>
      </PlatformTouchable>
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });

  it('should handle empty children', () => {
    expect(() => {
      render(<PlatformTouchable />);
    }).not.toThrow();
  });
});

describe('PlatformTouchable - Android, più figli', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });
  });

  afterAll(() => {
    if (descriptor) Object.defineProperty(Platform, 'OS', descriptor);
  });

  // Primo View sopra il nodo: per un figlio, il contenitore che il ramo Android
  // aggiunge; per il contenitore, il pulsante.
  const hostViewAbove = (node: RenderedNode) => {
    let current = node.parent;
    while (current && current.type !== 'View') current = current.parent;
    return current;
  };
  const containerStyleOf = (node: RenderedNode) =>
    StyleSheet.flatten(hostViewAbove(node)?.props.style) ?? {};

  it('dispone icona e testo come chiede lo stile del pulsante', () => {
    const { getByText } = render(
      <PlatformTouchable
        onPress={jest.fn()}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <Text>Icona</Text>
        <Text>Indietro</Text>
      </PlatformTouchable>
    );

    expect(containerStyleOf(getByText('Icona'))).toMatchObject({
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    });
  });

  it('porta il padding nel contenitore, così i figli assoluti si misurano dal bordo come su iOS', () => {
    const { getByText } = render(
      <PlatformTouchable
        onPress={jest.fn()}
        style={[{ padding: 12 }, { paddingHorizontal: 24 }]}
      >
        <Text>Titolo</Text>
        <Text style={{ position: 'absolute', top: 8, right: 12 }}>↗</Text>
      </PlatformTouchable>
    );

    const container = hostViewAbove(getByText('Titolo'));
    expect(StyleSheet.flatten(container?.props.style)).toMatchObject({
      padding: 12,
      paddingHorizontal: 24,
    });
    const touchable = container && hostViewAbove(container);
    expect(StyleSheet.flatten(touchable?.props.style)).toMatchObject({
      padding: 0,
      paddingHorizontal: 0,
    });
  });

  it("riempie il pulsante, così centratura e spaziatura valgono sull'intera area", () => {
    const { getByText } = render(
      <PlatformTouchable
        onPress={jest.fn()}
        style={{ justifyContent: 'space-between', flexDirection: 'row' }}
      >
        <Text>Sinistra</Text>
        <Text>Destra</Text>
      </PlatformTouchable>
    );

    expect(containerStyleOf(getByText('Destra'))).toMatchObject({
      flexGrow: 1,
      alignSelf: 'stretch',
      justifyContent: 'space-between',
    });
  });

  // Lo sfondo che chiude la modale di «La nostra storia» non ha figli: TouchableRipple
  // chiama React.Children.only, che senza un elemento lancia e porta alla schermata d'errore.
  it('senza figli non lancia e resta toccabile', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <PlatformTouchable onPress={onPress} testID="sfondo" />
    );
    fireEvent.press(getByTestId('sfondo'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
