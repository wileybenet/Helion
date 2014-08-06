angular.module('Mover', [])
  .service('Mover', ['Canvas', 'Bus', function(Canvas, Bus) {
    var getEntropyArc = function(start, end, entropy) {
      var side = Math.random() - 0.5;
      side = side / Math.abs(side);
      
      var vector = new Point(end.subtract(start)),
        offset = vector.length * entropy,
        midpoint = vector.multiply(0.5),
        normal = Math.atan(-midpoint.x / midpoint.y),
        dx = offset * Math.cos(normal) * side,
        dy = offset * Math.sin(normal) * side,
        middle = new Point([start.x+midpoint.x+dx, start.y+midpoint.y+dy]);

      return new Path.Arc(start, middle, end);
    };

    function Mover(start, options) {
      this.start = start;

      Bus.onFrame(this.onFrame.bind(this));

      return this;
    };

    Mover.prototype.to = function(loc) {
      if (loc.object.bounds.center.equals(this.start.object.bounds.center))
        return false;
      this.path = Path.Circle({
        center: this.start.object.bounds.center,
        radius: 2,
        fillColor: '#fff'
      });
      Canvas.movers.addChild(this.path);
      this.current = {};
      this.current.trajectory = getEntropyArc(this.path.bounds.center, loc.object.bounds.center, Math.random() / 3);
      this.current.curve = 0;
      this.current.position = 0;
      this.current.count = 0;
      this.current.speed = 1 / this.current.trajectory.length * 15 * this.current.trajectory.curves.length;
      this.current.total = this.current.trajectory.length / 15;
      Canvas.movers.addChild(this.current.trajectory);
    };

    Mover.prototype.move = function() {
      this.current.position += this.current.speed;
      this.path.position = this.current.trajectory.curves[this.current.curve].getPointAt(Math.min(this.current.position, 0.999), true);
      this.current.count++;
      if (this.current.position >= 1) {
        this.current.curve++;
        if (this.current.curve >= this.current.trajectory.curves.length) {
          this.current.trajectory.remove();
          this.path.remove();
          delete this.current;
        } else {
          this.current.position = 0;
        }
      }
    };

    Mover.prototype.onFrame = function(evt) {
      if (this.current) {
        this.current.trajectory.strokeColor = 'rgba(255,255,255,'+Math.min(this.current.count / 100, ((this.current.total-this.current.count) / 100), .3)+')';
        this.move();
      }
    };

    return Mover;
  }])