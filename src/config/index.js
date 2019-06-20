const path = require('path');

const rootPath = path.join(__dirname, '../');
const packagePath = path.join(rootPath, '../package.json');

module.exports.paths = {
  root: rootPath,
  schemas: path.join(rootPath, 'schemas'),
  modules: path.join(rootPath, 'modules')
};

module.exports.port = 9090;
module.exports.baseUrl = '/api';
module.exports.title = 'Adventure API';
module.exports.version = require(packagePath).version;

module.exports.secret = 't6w9z$C&F)H@McQfTjWnZr4u7x!A%D*G-KaNdRgUkXp2s5v8y/B?E(H+MbQeShVm';
module.exports.tokenLifetime = 60;

module.exports.prodDatabaseURL = 'mongodb://heroku_7wvmfchb:pa2ge9nhv3hk890bu6qhdtc1v5@ds051077.mlab.com:51077/heroku_7wvmfchb';
module.exports.devDatabaseURL = 'mongodb://localhost/galaxy';

module.exports.auth = require('./passport');
