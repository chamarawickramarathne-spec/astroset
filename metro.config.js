const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;

config.server = {
  ...config.server,
};

module.exports = config;
