angular.module('factories', [])
  .factory('Resource', ['$resource', function($resource) {
    return function(endpoint, dflts, actions) {
      var Res, listeners = {};
      actions.update = {
        method: 'PUT'
      };
      _.each(actions, function(obj, action) {
        listeners[action] = [];
        obj.transformResponse = function(data, headers) {
          listeners[action].forEach(function(cbFn) {
            cbFn();
          });
        };
      });

      Res = $resource(endpoint, dflts, actions);
      Res.prototype.on = function on(action, cbFn) {
        listeners[action].push(cbFn.bind(this));
      };
      return Res;
    };
  }])