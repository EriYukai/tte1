const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias['public'] = path.resolve(__dirname, 'public');
    config.entry = path.resolve(__dirname, 'src', 'index.js');
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.template = path.resolve(__dirname, 'index.html');
    }
  });
  return config;
};
