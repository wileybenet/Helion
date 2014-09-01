// libraries
var path = require('path'),
  fs = require('fs'),
  Q = require('q'),
  mongoose = require('mongoose');

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
    console.log('mongo connection error:', err);
    // console.log('\n reconnection #' + ++retries);
    // setTimeout(function() {
    //   connect(config);
    // }, 500);
  });

  db.once('open', function(err) {
    if (err) {
      console.log(' Error\n  mongo failed connection');
      deferred.reject(true);
    } else {
      console.log(' mongo connected\n  ' + configParams.dbName);
      deferred.resolve(null);
    }
  });

  return deferred.promise;
}

// module api
module.exports = {
  connect: connect
};