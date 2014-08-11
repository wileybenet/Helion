// libraries
var _ = require('lodash-node'),
  bcrypt = require('bcrypt'),
  storeApi = require('./store');

// models
exports.User = function User(data) {
  _.extend(this, data);
  this.password = bcrypt.hashSync(this.password, 8);
  return this;
}
exports.User.prototype.validPassword = function validPassword(password) {
  return bcrypt.compareSync(password, this.password);
};

exports.Body = function Body(data) {
  _.extend(this, data);
  return this;
}

exports.Collection = function Collection(data) {
  _.extend(this, data);
  return this;
}

// module api
exports.get = function get(type) {
  return exports[type.charAt(0).toUpperCase() + type.substr(1)];
};

exports.bind = function bind(store) {
  var model, fn, params;
  for (model in exports) {
    if (model.match(/^[A-Z]/)) {
      params = {
        type: model.toLowerCase(),
        Model: exports[model],
        dataStore: store
      };
      for (fn in storeApi) {
        exports[model][fn] = storeApi[fn].bind(params);
      }
      (function(Model) {
        Model.load = function(data) {
          return _.extend(Object.create(Model.prototype), data);
        };
      }(exports[model]));
    }
  }
};