import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Componente di test semplice
const TestComponent = () => {
  return (
    <View testID="test-container">
      <Text testID="test-text">Test Component</Text>
    </View>
  );
};

describe('App Configuration Tests', () => {
  it('dovrebbe renderizzare un componente semplice', () => {
    const { getByTestId } = render(<TestComponent />);

    // Test di base - verifica che il rendering funzioni
    expect(getByTestId('test-container')).toBeTruthy();
    expect(getByTestId('test-text')).toBeTruthy();
  });

  it('dovrebbe verificare il contenuto del testo', () => {
    const { getByText } = render(<TestComponent />);

    // Verifica che il testo sia presente
    expect(getByText('Test Component')).toBeTruthy();
  });
});
