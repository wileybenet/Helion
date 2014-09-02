angular.module('factories', [])
  .factory('Emitter', ['easing', function(easing) {
    var eventListeners = {
      frame: []
    },
      id = 0;

    function unBinder(name, _id) {
      return function() {
        for (var i = eventListeners[name].length - 1; i >= 0; i--) {
          if (_id === eventListeners[name][i]._id) {
            eventListeners[name].splice(i, 1);
          }
        }
      };
    }

    setInterval(function() {
      eventListeners.frame.forEach(function(fn) {
        fn();
      });
      paper.view.draw();
    }, 33.33);

    return {
      on: function on(evtName, cbFn) {
        cbFn._id = id++;
        eventListeners[evtName] = eventListeners[evtName] || [];
        eventListeners[evtName].push(cbFn);
        return unBinder(evtName, cbFn._id);
      },
      emit: function emit(evtName, data) {
        eventListeners[evtName].forEach(function(fn) {
          fn(data);
        });
      },
      onFrame: function onFrame(cbFn) {
        cbFn._id = id++;
        if (cbFn._name) {
          for (var i = eventListeners.frame.length - 1; i >= 0; i--) {
            if (cbFn._name === eventListeners.frame[i]._name) {
              eventListeners.frame.splice(i, 1);
            }
          }
        }

        eventListeners.frame.push(cbFn);

        return unBinder('frame', cbFn._id);
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
      }
    };
  }])
  .factory('Loader', ['$cacheFactory', function($cacheFactory) {
    var cache = $cacheFactory('asset');
    return {
      get: function(key, cbFn) {
        var value = cache.get(key);
        if (value)
          cbFn(value);
        else
          paper.project.importSVG('/static/images/' + key + '.svg', function(group) {
            cache.put(key, group);
            cbFn(group);
          });
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