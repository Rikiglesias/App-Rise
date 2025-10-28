module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated already injects the worklets plugin internally,
      // so we only register it once to avoid duplicate plugin issues in Jest.
      'react-native-reanimated/plugin',
    ],
  };
};
