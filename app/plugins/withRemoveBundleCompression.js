const { withAppBuildGradle } = require('@expo/config-plugins');

function removeBundleCompression(contents) {
  return contents.replace(/\s*enableBundleCompression\s*=\s*.*\n/g, '\n');
}

module.exports = function withRemoveBundleCompression(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults && config.modResults.contents) {
      config.modResults.contents = removeBundleCompression(
        config.modResults.contents
      );
    }
    return config;
  });
};
