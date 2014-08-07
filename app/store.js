var log = require('./log'),
  _ = require('lodash-node'),
  Q = require('q'),
  AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3(),
  bucketName = null,
  s3Obj = function(jsonStr) {
    var obj = typeof jsonStr === 'object' ? jsonStr : JSON.parse(jsonStr);
    obj.stringify = function() {
      return JSON.stringify(obj);
    };
    return obj;
  };

s3.listBuckets(function(err, data) {
  bucketName = data.Buckets[0].Name;
  log.process('Connected to s3 bucket: '+bucketName, 0);
});

module.exports = {
  all: function(type) {
    var deferred = Q.defer(),
      params = {Bucket: bucketName, Key: type};
    s3.getObject(params, function(err, data) {
      if (err)
        return deferred.reject(err);
      deferred.resolve(s3Obj(data.Body.toString()));
    });
    return deferred.promise;
  },
  findByName: function(type, name) {
    var deferred = Q.defer();
    this.all(type).then(function(arr) {
      var item = _.find(arr, {name: name});
      deferred.resolve(s3Obj(item));
    }, deferred.reject);
    return deferred.promise;
  },
  update: function(type, name, updates) {
    var this_ = this,
      deferred = Q.defer();
    this.all(type).then(function(arr) {
      var item = _.find(arr, {name: name});
      _.extend(item, updates);
      this_._save(type, arr).then(function() {
        deferred.resolve(s3Obj(item));
      }, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
  },
  create: function() {
    return null;
  },
  _save: function(type, data) {
    var deferred = Q.defer(),
      params = {Bucket: bucketName, Key: type, Body: data.stringify()};
    s3.putObject(params, function(err, data) {
      if (err)
        return deferred.reject(err);
      deferred.resolve(data);
    });
    return deferred.promise;
  }
};