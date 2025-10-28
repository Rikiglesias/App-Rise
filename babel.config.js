module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin', // Aggiornato per Expo SDK 54
      'react-native-reanimated/plugin', // Necessario per react-native-reanimated
    ],
  };
};
