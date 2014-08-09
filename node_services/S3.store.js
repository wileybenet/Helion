var _ = require('lodash-node'),
  Q = require('q'),
  uuid = require('uuid'),
  AWS = require('aws-sdk');

// helper
function s3Obj(jsonStr) {
  var obj = typeof jsonStr === 'object' ? jsonStr : JSON.parse(jsonStr);
  obj.stringify = function() {
    return JSON.stringify(obj);
  };
  return obj;
}

// module constructor
function Store(config) {
  if (config.path)
    AWS.config.loadFromPath(config.path);
  if (config.creds)
    AWS
  this.s3 = new AWS.S3();
  this.s3.listBuckets(this._bindBucket.bind(this));
}

// private
Store.prototype._bindBucket = function bindBucket(err, data) {
  this.bucketName = data.Buckets[0].Name;
  this.notify('AWS S3 connected:' + this.bucketName);
  this._refreshBackups();
};
Store.prototype._params = function _params(options) {
  var params = {
    Bucket: this.bucketName
  };
  options = options || {};
  if (options.type)
    params.Key = options.type + '.json' + (options.extension ? ('.' + options.extension) : '');
  if (options.data)
    params.Body = options.data.stringify();
  return params;
};
Store.prototype._refreshBackups = function _refreshBackups() {
  var this_ = this;
  this.s3.listObjects(this._params(), function(err, response) {
    response.Contents
      .filter(function(item) {
        return !item.Key.match(/^\.|backup$/);
      })
      .map(function(item) {
        return item.Key.split('.')[0];
      })
      .forEach(function(key) {
        this_.all(key).then(function(collection) {
          this_._save(key, collection, 'backup').then(function(data) {
            this_.notify('updated backup:'+key);
          });
        });
      });
  });
};
Store.prototype._find = function _find(type, match) {
  var deferred = Q.defer();
  this.all(type).then(function(arr) {
    var item = _.find(arr, match);
    deferred.resolve(s3Obj(item));
  }, deferred.reject);
  return deferred.promise;
};
Store.prototype._save = function _save(type, data, extension) {
  var deferred = Q.defer(),
    params = this._params({type: type, data: data, extension: extension});
  this.s3.putObject(params, function(err, data) {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve(data);
  });
  return deferred.promise;
};

// public
Store.prototype.onNotification = function onNotification(cbFn) {
  this.listeners = this.listeners || [];
  this.listeners.push(cbFn);
};
Store.prototype.notify = function notify(data) {
  this.listeners.forEach(function(cbFn) {
    cbFn(data);
  });
};
Store.prototype.all = function all(type) {
  var deferred = Q.defer();
  this.s3.getObject(this._params({type: type}), function(err, data) {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve(s3Obj(data.Body.toString()));
  });
  return deferred.promise;
};
Store.prototype.find = function find(type, id) {
  return this._find(type, {_id: id});
};
Store.prototype.update = function update(type, id, data) {
  var this_ = this,
    deferred = Q.defer();
  this.all(type).then(function(arr) {
    var item = _.find(arr, {_id: id});
    _.extend(item, data);
    this_._save(type, arr).then(function() {
      deferred.resolve(s3Obj(item));
    }, deferred.reject);
  }, deferred.reject);
  return deferred.promise;
};
Store.prototype.create = function create(type, data) {
  var this_ = this,
    deferred = Q.defer();
  this.all(type).then(function(arr) {
    data._id = uuid.v4();
    arr.push(data);
    this_._save(type, arr).then(function() {
      deferred.resolve(s3Obj(data));
    }, deferred.reject);
  });
  return deferred.promise;
};
Store.prototype.destroy = function destroy(type, id) {
  var this_ = this,
    deferred = Q.defer();
  this.all(type).then(function(arr) {
    var idx = _.findIndex(arr, {_id: id}),
      item = arr.splice(idx, 1);
    this_._save(type, arr).then(function() {
      deferred.resolve(s3Obj(item));
    }, deferred.reject);
  }, deferred.reject);
  return deferred.promise;
};

module.exports = Store;