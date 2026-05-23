const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    // Force Metro to resolve .js extensions for sonner-native's module files
    sourceExts: [
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'cjs', // ← add this
      'mjs', // ← add this
    ],
  },
});

module.exports = withNativeWind(config, { input: './global.css' });
