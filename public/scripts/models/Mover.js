angular.module('Mover', [])
  .service('Mover', ['Base', 'System', 'Canvas', 'Emitter', 'Resource', 'Utils', function(Base, System, Canvas, Emitter, Resource, Utils) {
    var SPEED = .4,
      endpoint = '/api/v1/mover/:id',
      crudApi = Resource(endpoint, {}, {});

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
      all: crudApi.query
    }, {
      initialize: function Mover(options) {
        var homeBody = System.get(options.home);
        this.currentPosition = homeBody.object.bounds.center
        this.waypoints = [homeBody].concat(options.waypoints.map(function(_id) {
          return System.get(_id);
        }));
        this.current = {};

        this.options = options.config || {};

        this.to(1, options.config.finish || 'loop', 1);

        return this;
      },
      to: function to(state, action, direction) {
        var this_ = this;
        var destination = this.waypoints[state];
        if (destination.object.bounds.center.equals(this.currentPosition))
          return false;

        this.path = new Path.Rectangle({
          from: [this.currentPosition.x, this.currentPosition.y - 20],
          to: [this.currentPosition.x + 1, this.currentPosition.y + 20],
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

        Emitter.animate(function(position, percentComplete, time) {
          var arcSize = 1 / this_.trajectory.curves.length,
            currentSegment = Math.ceil(percentComplete / arcSize) - (percentComplete === 0 ? 0 : 1),
            relativePosition = (position - currentSegment * arcSize) / arcSize;

          var location = this_.trajectory.curves[currentSegment].getLocationAt(Math.min(relativePosition, 0.999), true);
          this_.path.position = location.point;
          this_.path.rotation = location.tangent.angle;
        }, duration, 'easeInOutCubic', this.transfer.bind(this_));

        Emitter.animate(function(position) {
          this_.trajectory.strokeColor = 'rgba('+Utils.hexToRgb('fff')+','+(position * 0.3)+')';
        }, 2000);
      },
      transfer: function transfer() {
        var this_ = this,
          trajectory = this.trajectory;
        Emitter.animate(function(position) {
          trajectory.strokeColor = 'rgba('+Utils.hexToRgb('fff')+','+((1 - position) * 0.3)+')';
        }, 1000, function() {
          trajectory.remove();
        });
        this.path.remove();
        
        setTimeout(function() {
          this_.cbFn();
        }, this.options.layover || 10);
      }
    });
  }]);

