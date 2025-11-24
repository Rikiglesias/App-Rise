const React = require('react');
const { View, Text } = require('react-native');

const MapView = (props) => {
  return (
    <View style={[props.style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
      <Text>Map Preview (Web)</Text>
      {props.children}
    </View>
  );
};

MapView.Marker = (props) => <View />;
MapView.Callout = (props) => <View />;
MapView.Provider = {
  GOOGLE: 'google',
  DEFAULT: 'default',
};

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = MapView.Marker;
module.exports.Callout = MapView.Callout;
module.exports.PROVIDER_GOOGLE = 'google';
module.exports.PROVIDER_DEFAULT = 'default';
