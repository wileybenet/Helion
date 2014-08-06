angular.module('Utilities', [])
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
        listeners.frame.push(cbFn);
      },
      '$init': function() {
        view.onFrame = function(evt) {
          listeners.frame.forEach(function(fn) {
            fn(evt);
          });
        };
      }
    };
  }])
  .factory('Utils', [function() {
    return {
      luminosity: function(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
          hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
          c = parseInt(hex.substr(i*2,2), 16);
          c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
          rgb += ("00"+c).substr(c.length);
        }

        return rgb;
      },
      circumscribeRadius: function(rect) {
        var x = rect.width/2,
          y = rect.height/2;
        return Math.sqrt(x*x + y*y);
      }
    };
  }]);
