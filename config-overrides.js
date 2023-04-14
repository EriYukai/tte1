const path = require('path');

module.exports = function override(config, env) {
  // public 폴더에 대한 별칭 설정
  config.resolve.alias['public'] = path.resolve(__dirname, 'public');
  
  // 프로젝트 루트에 있는 src/index.js를 진입점으로 설정
  config.entry = path.resolve(__dirname, 'src', 'index.js');
  
  // 프로젝트 루트에 있는 index.html를 사용하기 위해 HtmlWebpackPlugin 설정 변경
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.template = path.resolve(__dirname, 'public', 'index.html');
    }
  });

  // 수정된 설정을 반환합니다.
  return config;
};
