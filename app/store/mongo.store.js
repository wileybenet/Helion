// libraries
var path = require('path'),
  fs = require('fs'),
  Q = require('q'),
  mongoose = require('mongoose');

// dependencies
var log = require('../logger').appLogger;

// helpers
var retries = 0;

function connect(config) {
  var deferred = Q.defer(),
    configParams = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../..', config.path))),
    db = mongoose.connection,
    connectionStr = [
      'mongodb://',
      configParams.username,
      ':',
      configParams.password,
      '@kahana.mongohq.com:10005/',
      configParams.dbName
    ].join('');

  mongoose.connect(connectionStr);
  
  db.on('error', function(err) {
    log.error('mongo connection error:', err);
    // console.log('\n reconnection #' + ++retries);
    // setTimeout(function() {
    //   connect(config);
    // }, 500);
  });

  db.once('open', function(err) {
    if (err) {
      log.error('mongo failed connection');
      deferred.reject(true);
    } else {
      log.info('mongo connected %s', configParams.dbName);
      deferred.resolve(null);
    }
  });

  return deferred.promise;
}

// module api
module.exports = {
  connect: connect
};