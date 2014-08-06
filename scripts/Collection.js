angular.module('Collection', [])
  .service('Collection', ['Canvas', 'Utils', function(Canvas, Utils) {
    function Collection(name, bodies) {
      var this_ = this,
        raduis;
      this.name = name;
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
      }

      paper.view.draw();
    };

    Collection.prototype.updateBounds = function() {
      var radius = Utils.circumscribeRadius(this.paths.bounds);
      this.path.position = this.paths.bounds.center;
      this.path.scale(radius/this.path.radius);
      this.path.radius = radius;
    };

    return Collection;
  }]);