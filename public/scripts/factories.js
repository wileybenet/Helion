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
      animate: function animate(_name, _stepFn, _duration, _easingFnName, _cbFn) {
        var args = [].slice.call(arguments, 0);
        if (typeof args[0] === 'function')
          args.unshift(undefined);
        if (typeof args[3] === 'function')
          args.splice(3, 0, undefined);

        var name = args[0],
          stepFn = args[1],
          duration = args[2],
          easingFnName = args[3],
          cbFn = args[4];
        
        var startTime = +new Date(),
          easingFn = easingFnName ? easing[easingFnName] : function(x) { return x; },
          unbind;

        function frameFn() {
          var currentTime = (+new Date() - startTime),
            percentComplete = currentTime / duration,
            postition = easingFn(percentComplete, currentTime, 0, 1, duration, .8);

          if (percentComplete >= 1) {
            stepFn(1, 1, currentTime);
            cbFn && cbFn();
            unbind();
          } else {
            stepFn(postition, percentComplete, currentTime);
          }
        };

        frameFn._name = name;
        
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