angular.module('Collection', [])
  .service('Collection', ['$resource', 'Canvas', 'Utils', function($resource, Canvas, Utils) {
    var resource = $resource('/api/v1/collection', {}, {});
    function Collection(name, bodies, options) {
      var this_ = this,
        raduis;
      this.name = name;
      this.bodies = bodies;
      this.paths = new Group(bodies.pluck('path'));
      if (bodies.length > 1) {
        radius = Utils.circumscribeRadius(this.paths.bounds);
        this.path = new Path.Circle({
          center: this.paths.bounds.center, 
          radius: radius
        });

        this.path.radius = radius;

        this.path.strokeColor = 'white';
        this.path.opacity = 0.2;
        this.path.fillColor = 'rgba(0,0,0,0.2)';

        bodies.forEach(function(body) {
          if (body instanceof Group) {
            console.log(body);
          } else {
            body.on('move', function(data) {
              this_.updateBounds();
            });
          }
        });
        Canvas.background.addChild(this.path);

        this.path.onMouseEnter = this.onMouseEnter.bind(this);
        this.path.onMouseLeave = this.onMouseLeave.bind(this);
      } else {
        this.bodies[0].path.onMouseEnter = this.onMouseEnter.bind(this);
        this.bodies[0].path.onMouseLeave = this.onMouseLeave.bind(this);
      }
    };

    Collection.prototype.onMouseEnter = function() {
      this.bodies.forEach(function(body) {
        body.toggle(true);
      });
    };

    Collection.prototype.onMouseLeave = function() {
      this.bodies.forEach(function(body) {
        body.toggle();
      });
    };

    Collection.prototype.updateBounds = function() {
      var radius = Utils.circumscribeRadius(this.paths.bounds);
      this.path.position = this.paths.bounds.center;
      this.path.scale(radius/this.path.radius);
      this.path.radius = radius;
    };

    Collection.query = resource.query;
    Collection.save = resource.save;

    return Collection;
  }]);