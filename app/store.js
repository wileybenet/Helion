// libraries
var _ = require('lodash-node'),
  Q = require('q'),
  uuid = require('uuid');

// module api
var api = module.exports = {
  _search: function _search(match) {
    var deferred = Q.defer();
    api.all.call(this).then(function(arr) {
      var item = _.find(arr, match);
      if (item)
        deferred.resolve(item);
      else
        deferred.reject(null);
    }, deferred.reject);
    return deferred.promise;
  },
  _persist: function _persist(data) {
    var this_ = this,
      deferred = Q.defer();
    this.dataStore.put(this.type, data, function(err, list) {
      if (err)
        deferred.reject(err);
      else {
        list = list.map(function(data) {
          return this_.Model.load(data);
        });
        deferred.resolve(list);
      }
    });
    return deferred.promise;
  },
  all: function all() {
    var this_ = this,
      deferred = Q.defer();
    this.dataStore.get(this.type, function(err, list) {
      if (err)
        deferred.reject(err);
      else {
        list = list.map(function(data) {
          return this_.Model.load(data);
        });
        deferred.resolve(list);
      }
    });
    return deferred.promise;
  },
  find: function find(id) {
    return api._search.call(this, {_id: id});
  },
  findWhere: function find(params) {
    return api._search.call(this, params);
  },
  update: function update(id, data) {
    var this_ = this,
      deferred = Q.defer();
    api.all.call(this).then(function(arr) {
      var item = _.find(arr, {_id: id});
      _.extend(item, data);
      api._persist.call(this_, arr).then(function() {
        deferred.resolve(item);
      }, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
  },
  create: function create(model) {
    var this_ = this,
      deferred = Q.defer();
    api.all.call(this).then(function(arr) {
      model._id = uuid.v4();
      arr.push(model);
      api._persist.call(this_, arr).then(function() {
        deferred.resolve(model);
      }, deferred.reject);
    });
    return deferred.promise;
  },
  destroy: function destroy(id) {
    var this_ = this,
      deferred = Q.defer();
    api.all.call(this).then(function(arr) {
      var idx = _.findIndex(arr, {_id: id}),
        item = arr.splice(idx, 1)[0];
      api._persist.call(this_, arr).then(function() {
        deferred.resolve(item);
      }, deferred.reject);
    }, deferred.reject);
    return deferred.promise;
  }
};