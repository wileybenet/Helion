// libraries
var fs = require('fs'),
  _ = require('lodash-node'),
  bcrypt = require('bcrypt'),
  storeApi = require('./store');

fs.readdirSync(__dirname + '/models')
  .forEach(function(name) {
    var model = name.split('.')[0];
    exports[model] = require('./models/' + name);
  });

// module api
exports.get = function get(type) {
  return exports[type.charAt(0).toUpperCase() + type.substr(1)];
};

exports.all = function all() {
  return _.filter(exports, function(fn) {
    return fn.name.match(/^[A-Z]/);
  });
}

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
        Model.prototype.save = Model.prototype.save || function() {
          if (this._id)
            Model.update(this._id, this);
          else
            Model.create(this);
        };
      }(exports[model]));
    }
  }
};