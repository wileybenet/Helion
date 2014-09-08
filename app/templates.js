// libraries
var path = require('path'),
  fs = require('fs'),
  _ = require('lodash-node'),
  Handlebars = require('handlebars');

// dependencies
var log = require('./logger').appLogger;

// helpers
function readDir(dir, base) {
  var files = [];
  fs.readdirSync(dir).forEach(function(name) {
    var dirname;
    if (fs.lstatSync(dirname = dir + '/' + name).isDirectory()) {
      files = files.concat(readDir(dirname, name + '/'));
    } else {
      files.push(base + name);
    }
  });
  return files;
}

// html cache
var compiledTemplates = {
  home: (function() {
    var template = Handlebars.compile(fs.readFileSync(__dirname + '/views/home.html').toString()),
      files = _.compact(readDir(path.resolve(__dirname, '..', 'public/scripts'), '')
        .map(function(fileName) {
          return fileName.match(/\.js$/) ? {
            path: fileName
          } : false;
        }));

    files.unshift(files.splice(_.findIndex(files, {path: 'lib/angular.js'}), 1)[0]);

    return template({ scripts: files });
  }())
}

module.exports = {
  home: function home(req, res) {
    res.send(compiledTemplates.home).end();
  }
}