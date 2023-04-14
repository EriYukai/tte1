const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias['public'] = path.resolve(__dirname, 'public');
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.template = path.resolve(__dirname, 'index.html');
    }
  });

  // 웹팩 설정에서 entry 속성 변경
  config.entry = path.resolve(__dirname, 'src', 'your-custom-entry-file.js');

  return config;
};
