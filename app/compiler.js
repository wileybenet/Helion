// libraries
var fs = require('fs'),
  path = require('path'),
  UglifyJS = require('uglify-js'),
  CleanCSS = require('clean-css'),
  minCSS = new CleanCSS(),
  crypto = require('crypto');

// dependencies
var assets = require('./assets');

// module api
module.exports = {
  js: function js() {
    var raw = assets.js.map(function(filePath) {
      return fs.readFileSync(path.resolve(__dirname, '..', 'public', filePath.path)).toString();
    }).reduce(function(memo, str) {
      memo += str;
      if (memo.charAt(memo.length - 1) !== ';')
        memo += ';';
      return memo;
    }, '');
    return UglifyJS.minify(raw, {fromString: true}).code;
  },
  css: function css() {
    var raw = assets.css.map(function(filePath) {
      return fs.readFileSync(path.resolve(__dirname, '..', 'public', filePath.path)).toString();
    }).join('\n');
    return minCSS.minify(raw);
  },
  getHashName: function getHashName(type) {
    var file = this[type]();
    return crypto.createHash('md5').update(file).digest('hex') + '.' + type;
  }
};