angular.module('factories', [])
  .factory('Bus', ['easing', function(easing) {
    var listeners = {
        data: [],
        frame: []
      },
      id = 0;
    return {
      onData: function onData(cbFn) {
        listeners.data.push(cbFn);
      },
      push: function push(data) {
        listeners.data.forEach(function(fn) {
          fn(data);
        });
      },
      onFrame: function onFrame(cbFn) {
        cbFn._id = id++;
        listeners.frame.push(cbFn);
        return function() {
          for (var i = listeners.frame.length - 1; i >= 0; i--) {
            if (cbFn._id === listeners.frame[i]._id) {
              listeners.frame.splice(i, 1);
            }
          }
        };
      },
      animate: function animate(stepFn, duration, easingFnName) {
        var startTime = +new Date(),
          easingFn = easingFnName ? easing[easingFnName] : function(x) { return x; },
          lastPercent;

        var unbind = this.onFrame(function() {
          var currentTime = (+new Date() - startTime),
            percentComplete = currentTime / duration;

          percentComplete = easingFn(percentComplete, currentTime, 0, 1, duration);

          if (percentComplete >= 1 || percentComplete < lastPercent) {
            unbind();
            stepFn(1);
          } else {
            stepFn(lastPercent = percentComplete);
          }
        });
      },
      '$init': function $init() {
        // view.onFrame = function(evt) {
        setInterval(function() {
          listeners.frame.forEach(function(fn) {
            fn();
          });
          paper.view.draw();
        }, 50);
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