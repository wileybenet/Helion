// libraries
var path = require('path'),
  fs = require('fs'),
  Q = require('q'),
  mongoose = require('mongoose');

// module api
module.exports = {
  connect: function(config) {
    var deferred = Q.defer(),
      config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../..', config.path))),
      db = mongoose.connection,
      connectionStr = [
        'mongodb://',
        config.username,
        ':',
        config.password,
        '@kahana.mongohq.com:10005/',
        config.dbName
      ].join('');

    mongoose.connect(connectionStr);
    
    db.on('error', function(err) {
      console.log('mongo connection error:', err);
    });

    db.once('open', function(err) {
      if (err) {
        console.log(' Error\n  mongo failed connection');
        deferred.reject(true);
      } else {
        console.log(' mongo connected\n  ' + config.dbName);
        deferred.resolve(null);
      }
    });

    return deferred.promise;
  }
};