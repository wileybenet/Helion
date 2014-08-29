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
        if (cbFn._name) {
          for (var i = listeners.frame.length - 1; i >= 0; i--) {
            if (cbFn._name === listeners.frame[i]._name) {
              listeners.frame.splice(i, 1);
            }
          }
        }

        listeners.frame.push(cbFn);
        return function() {
          for (var i = listeners.frame.length - 1; i >= 0; i--) {
            if (cbFn._id === listeners.frame[i]._id) {
              listeners.frame.splice(i, 1);
            }
          }
        };
      },
      animate: function animate(name, stepFn, duration, easingFnName) {
        if (typeof name === 'function') {
          easingFnName = duration;
          duration = stepFn;
          stepFn = name;
        }
        var startTime = +new Date(),
          easingFn = easingFnName ? easing[easingFnName] : function(x) { return x; },
          lastPosition,
          unbind;

        var frameFn = function() {
          var currentTime = (+new Date() - startTime),
            percentComplete = currentTime / duration,
            postition = easingFn(percentComplete, currentTime, 0, 1, duration, .8);

          if (percentComplete >= 1) {
            unbind();
            stepFn(1);
          } else {
            stepFn(lastPosition = postition);
          }
        };

        if (typeof name === 'string') {
          frameFn._name = name;
        }
        
        unbind = this.onFrame(frameFn);
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