// libraries
var path = require('path'),
  fs = require('fs'),
  _ = require('lodash-node');

// dependencies
var log = require('./logger').appLogger;

// helpers
function floatItems(list, itemObject) {
  for (var key in itemObject) {
    [].concat(itemObject[key]).reverse().forEach(function(item) {
      var objectToMatch = {};
      objectToMatch[key] = item;
      list.unshift(list.splice(_.findIndex(list, objectToMatch), 1)[0]);
    });
  }
}
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

module.exports = {
  js: (function() {
    var files = _.compact(readDir(path.resolve(__dirname, '..', 'public/scripts'), '')
      .map(function(fileName) {
        return fileName.match(/\.js$/) ? {
          path: 'scripts/' + fileName
        } : false;
      }));

    floatItems(files, {path: [
      'scripts/lib/es5-shim.js',
      'scripts/lib/paper-full.js',
      'scripts/lib/lodash.js',
      'scripts/lib/jquery.js',
      'scripts/lib/angular.js'
    ]});

    return files;
  }()),
  css: (function() {
    var files = _.compact(readDir(path.resolve(__dirname, '..', 'public/css'), '')
      .map(function(fileName) {
        return fileName.match(/\.css$/) ? {
          path: 'css/' + fileName
        } : false;
      }));

    floatItems(files, {path: [
      'css/main.css'
    ]});

    return files;
  }()),
};