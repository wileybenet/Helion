angular.module('factories', [])
  .factory('Bus', [function() {
    var listeners = {
      data: [],
      frame: []
    };
    return {
      onData: function(cbFn) {
        listeners.data.push(cbFn);
      },
      push: function(data) {
        listeners.data.forEach(function(fn) {
          fn(data);
        });
      },
      onFrame: function(cbFn) {
        var idx = listeners.frame.push(cbFn) - 1;
        console.log(listeners.frame);
        return function() {
          var x = 10;
          listeners.frame.splice(idx, 1);
        };
      },
      '$init': function() {
        // view.onFrame = function(evt) {
        setInterval(function() {
          listeners.frame.forEach(function(fn) {
            fn();
          });
          paper.view.draw();
        }, 100);
        // };
      }
    };
  }])
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