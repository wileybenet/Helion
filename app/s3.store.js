// libraries
var _ = require('lodash-node'),
  Q = require('q'),
  AWS = require('aws-sdk');

// helper
function KeyValueStore(s3, bucketName, dataStoreInfo) {
  this.s3 = s3;
  this.bucketName = bucketName;
  _.extend(this, dataStoreInfo);
}
KeyValueStore.prototype.get = function get(key, cbFn) {
  console.log(' S3 getting :' + key);
  this.s3.getObject({Bucket: this.bucketName, Key: key + '.json'}, function(err, data) {
    if (err) {
      console.log(' ERROR key not found :' + key);
      cbFn(err);
    } else {
      cbFn(null, JSON.parse(data.Body.toString()));
    }
  });
};
KeyValueStore.prototype.put = function put(key, value, cbFn) {
  var payload = JSON.stringify(value);
  console.log(' S3 putting :' + key + ' = ' + payload);
  this.s3.putObject({Bucket: this.bucketName, Key: key + '.json', Body: payload}, function(err, data) {
    if (err)
      cbFn(err);
    else
      cbFn(null, value);
  });
};

// module api
module.exports = {
  updateBackups: function(s3, bucketName) {
    s3.listObjects({Bucket: bucketName}, function(err, response) {
      console.log(' S3 backups');
      response.Contents
        .filter(function(item) {
          return !item.Key.match(/^\.|backup$/);
        })
        .map(function(item) {
          return item.Key;
        })
        .forEach(function(key) {
          s3.getObject({Bucket: bucketName, Key: key}, function(err, data) {
            s3.putObject({Bucket: bucketName, Key: key + '.backup'}, function(err, res) {
              console.log('  updated :' + key + '.backup');
            });
          });
        });
    });
  },
  connect: function(config) {
    var this_ = this,
      deferred = Q.defer();
    if (config.path)
      AWS.config.loadFromPath(config.path);
    if (config.creds)
      AWS // backlogged
    s3 = new AWS.S3();
    s3.listBuckets(function(err, data) {
      bucketName = data.Buckets[0].Name;
      s3.getObject({Bucket: bucketName, Key: '.ds'}, function(err, data) {
        var data = JSON.parse(data.Body.toString()),
          keyValStore = new KeyValueStore(s3, bucketName, data);
        console.log(' S3 connected\n  ' + keyValStore.name);
        deferred.resolve(keyValStore);
      });  
      if (config.updateBackups)
        this_.updateBackups(s3, bucketName);
    });
    return deferred.promise;
  }
};