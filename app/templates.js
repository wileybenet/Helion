// libraries
var fs = require('fs'),
  Handlebars = require('handlebars');

// dependencies
var processInfo = require('./process.info'),
  log = require('./logger').appLogger,
  compiler = require('./compiler'),
  assets = require('./assets');

// html cache
var compiledTemplates = {
  home: (function() {
    var template = Handlebars.compile(fs.readFileSync(__dirname + '/views/home.html').toString()),
      scripts, sheets;
    if (processInfo.env === 'prod' || processInfo.env === 'test') {
      scripts = [{
        path: 'assets/' + compiler.getHashName('js')
      }];
      sheets = [{
        path: 'assets/' + compiler.getHashName('css')
      }];
    } else {
      scripts = assets.js;
      sheets = assets.css;
    }
    return template({ scripts: scripts, sheets: sheets });
  }())
}

module.exports = {
  home: function home(req, res) {
    res.send(compiledTemplates.home).end();
  }
}