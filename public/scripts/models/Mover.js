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
        this.position = start.object.bounds.center
        this.waypoints = [start];
        this.current = {};

        this.options = options || {};

        Bus.onFrame(this.onFrame.bind(this));

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
        var destination = this.waypoints[state];
        if (destination.object.bounds.center.equals(this.position))
          return false;
        this.path = Path.Circle({
          center: this.position,
          radius: 1,
          fillColor: this.options.color
            || Utils.luminosity(this.waypoints[0].color, 0.8)
            || '#fff'
        });
        this.moving = true;
        this.current.trajectory = getEntropyArc(
          this.path.bounds.center,
          destination.object.bounds.center,
          Array.isArray(this.options.fixed)
            ? this.options.fixed[direction > 0
              ? ((state-direction > -1) ? state-direction : this.waypoints.length-1)
              : state
            ]
            : this.options.fixed
        );
        this.current.trajectory.strokeWidth = 0.5;
        this.current.curve = 0;
        this.current.position = 0;
        this.current.count = 0;
        this.current.speed = 1 / this.current.trajectory.length * SPEED * this.current.trajectory.curves.length;
        this.current.total = this.current.trajectory.length / SPEED;
        this.current.cbFn = function() {
          var dir = direction,
            st = state+direction;
          this.position = destination.object.bounds.center;
          if (action === 'bounce') {
            if (st === this.waypoints.length || st < 0) {
              dir *= -1;
            }
            this.to(state+dir, 'bounce', dir);
          } else if (action === 'loop') {
            if (st === this.waypoints.length) {
              st = 0;
            }
            this.to(st, 'loop', dir);
          }
        };

        Canvas.tracks.addChild(this.current.trajectory);
        Canvas.movers.addChild(this.path);
      },
      move: function move() {
        var this_ = this;
        this.current.position += this.current.speed;
        this.path.position = this.current.trajectory.curves[this.current.curve].getPointAt(Math.min(this.current.position, 0.999), true);
        this.current.count++;
        this.current.trajectory.strokeColor = 'rgba('+Utils.hexToRgb('fff')+','+Math.min(this.current.count / 200, ((this.current.total-this.current.count) / 200), 0.1)+')';
        if (this.current.position >= 1) {
          this.current.curve++;
          if (this.current.curve >= this.current.trajectory.curves.length) {
            this.current.trajectory.remove();
            this.path.remove();
            this.moving = false;
            setTimeout(function() {
              this_.current.cbFn.call(this_);
            }, this.options.layover || 500);
          } else {
            this.current.position = 0;
          }
        }
      },
      onFrame: function onFrame(evt) {
        if (this.moving) {
          this.move();
        }
      }
    });
  }]);