const React = require('react');
const { View, Text } = require('react-native');

// Mock di @maplibre/maplibre-react-native dove il modulo nativo NON è disponibile:
// - web (react-native-web non ha la mappa nativa MapLibre);
// - dev Expo Go SDK 54 (modulo nativo assente => senza mock crasherebbe).
// OPT-IN dev client: con EXPO_PUBLIC_USE_REAL_MAPS=true il mock è disattivato in dev,
// così un dev build (che HA il modulo nativo) carica la mappa reale.
const Map = (props) => (
  <View
    style={[
      props.style,
      { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    ]}
  >
    <Text>Map Preview (Web)</Text>
    {props.children}
  </View>
);

const Camera = () => null;
const Marker = (props) => <View>{props.children}</View>;

module.exports = { Map, Camera, Marker };
