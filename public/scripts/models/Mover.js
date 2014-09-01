angular.module('Mover', [])
  .service('Mover', ['Base', 'Canvas', 'Bus', 'Utils', function(Base, Canvas, Bus, Utils) {
    var SPEED = .4;

    function getEntropy() {
      var side = Math.random() - 0.5;
      return (Math.random() / 3) * (side / Math.abs(side));
    }
    function getEntropyArc(start, end, entropy) {
      var vector = new Point(end.subtract(start)),
        offset = vector.length * (entropy || getEntropy()),
        midpoint = vector.multiply(0.5),
        normal = Math.atan(-midpoint.x / midpoint.y),
        dx = offset * Math.cos(normal),
        dy = offset * Math.sin(normal),
        middle = new Point([start.x+midpoint.x+dx, start.y+midpoint.y+dy]);

      return new Path.Arc(start, middle, end);
    };

    return Base.extend({
      all: function() {}
    }, {
      initialize: function Mover(start, options) {
        this.currentPosition = start.object.bounds.center
        this.waypoints = [start];
        this.current = {};

        this.options = options || {};

        return this;
      },
      setWaypoints: function setWaypoints(waypoints) {
        this.waypoints = this.waypoints.concat(waypoints);
        return this;
      },
      start: function start(action) {
        if (this.waypoints.length > 1)
          this.to(1, action, 1);
      },
      to: function to(state, action, direction) {
        var this_ = this;
        var destination = this.waypoints[state];
        if (destination.object.bounds.center.equals(this.currentPosition))
          return false;

        this.path = Path.Circle({
          center: this.currentPosition,
          radius: 1,
          fillColor: this.options.color
            || Utils.luminosity(this.waypoints[0].color, 0.8)
            || '#fff'
        });

        this.trajectory = getEntropyArc(
          this.path.bounds.center,
          destination.object.bounds.center,
          Array.isArray(this.options.fixed)
            ? this.options.fixed[direction > 0
              ? ((state-direction > -1) ? state-direction : this.waypoints.length-1)
              : state
            ]
            : this.options.fixed
        );
        this.trajectory.strokeWidth = 0.5;

        this.cbFn = function() {
          var dir = direction,
            st = state + direction;
          this.currentPosition = destination.object.bounds.center;
          if (action === 'bounce') {
            if (st === this.waypoints.length || st < 0) {
              dir *= -1;
            }
            this.to(state + dir, 'bounce', dir);
          } else if (action === 'loop') {
            if (st === this.waypoints.length) {
              st = 0;
            }
            this.to(st, 'loop', dir);
          }
        };

        var duration = this.trajectory.length * (this.options.speed ? (57 / this.options.speed) : 57);

        Canvas.tracks.addChild(this.trajectory);
        Canvas.movers.addChild(this.path);

        Bus.animate(function(position, percentComplete, time) {
          var arcSize = 1 / this_.trajectory.curves.length,
            currentSegment = Math.ceil(percentComplete / arcSize) - (percentComplete === 0 ? 0 : 1),
            relativePosition = (position - currentSegment * arcSize) / arcSize;
          this_.path.position = this_.trajectory.curves[currentSegment].getPointAt(Math.min(relativePosition, 0.999), true);
        }, duration, this.transfer.bind(this_));
        Bus.animate(function(position) {
          this_.trajectory.strokeColor = 'rgba('+Utils.hexToRgb('fff')+','+(position * 0.3)+')';
        }, 2000);
      },
      transfer: function transfer() {
        var this_ = this,
          trajectory = this.trajectory;
        Bus.animate(function(position) {
          trajectory.strokeColor = 'rgba('+Utils.hexToRgb('fff')+','+((1 - position) * 0.3)+')';
        }, 1000, function() {
          trajectory.remove();
        });
        this.path.remove();
        
        setTimeout(function() {
          this_.cbFn();
        }, this.options.layover || 50);
      }
    });
  }]);

