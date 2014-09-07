angular.module('Body', [])
  .service('Body', ['Base', 'Resource', 'Emitter', 'Loader', 'Canvas', 'Utils',
  function(Base, Resource, Emitter, Loader, Canvas, Utils) {
    var endpoint = '/api/v1/body/:id',
      crudApi = Resource(endpoint, {}, {}),
      groupId = 0;

    function drillIntoGroup(group) {
      var paths = [];
      group.children.forEach(function(path) {
        var newPath,
          westPoint, eastPoint;
        if (path instanceof Shape) {
          newPath = path.toPath();
          path.remove();
          path = newPath;
        }
        if (path.children && path.children.length > 0) {
          paths = paths.concat(drillIntoGroup(path));
        } else {
          path.flatten(3);
          westPoint = path.segments[0].point;
          eastPoint = path.segments[0].point;
          path.segments.forEach(function(item) {
            item._groupId = groupId++;
            item.point.original_x = item.point.x;
            item.point.original_y = item.point.y;
            if (item.point.x < westPoint.x) {
              westPoint = item.point;
            }
            if (item.point.x > eastPoint.x) {
              eastPoint = item.point;
            }
          });
          path._westPoint = westPoint;
          path._eastPoint = eastPoint;

          paths.push(path);
        }
      });
      return paths;
    }

    return Base.extend({
      all: crudApi.query,
      create: crudApi.save
    }, {
      initialize: function Body(model) {
        var this_ = this,
          ratio = $(window).width(),
          radius = model.config.radius / 100 * ratio,
          options = model.config || {},
          resource = Resource(endpoint, { id: '@_id' }, {});

        this.model = new resource(model);

        this.name = model.name;
        this.color = Utils.luminosity(options.fill, 0);
        this.object = new Path.Circle({
          radius: radius,
          center: new Point(model.position[0] / 100 * ratio, model.position[1] / 100 * ratio),
        });
        this.object.fillColor = Utils.luminosity(options.fill, 0);


        this.objectNightShade = this.object.clone();
        this.objectNightShade.fillColor = {
          gradient: {
            stops: [
              new Color(0,0,0,0),
              new Color(0,0,0,0.3),
              new Color(0,0,0,0.7),
              new Color(0,0,0,1)
            ],
            radial: true
          },
          origin: [this.object.position.x-(radius*0.75), this.object.position.y],
          destination: this.object.bounds.rightCenter,
        };
        this.objectNightShade.scale(1.05);

        this.objectClippingMask = this.object.clone();
        this.objectClippingMask.scale(1);

        this.objectDropShadow = this.object.clone();

        this.objectDropShadow.style = {
          shadowColor: '#000',
          shadowBlur: 6,
          shadowOffset: new Point(5, 5),
          strokeColor: options.stroke ? Utils.luminosity(options.stroke, -0.3) : '#000',
          strokeWidth: options.strokeWidth || 2,
          strokeOpacity: options.strokeOpacity || 0.2
        };

        if (options.stroke) {
          this.objectDropShadow.shadowColor = Utils.luminosity(options.shadow || options.stroke, 0);
          this.objectDropShadow.shadowBlur = 20;
          this.objectDropShadow.shadowOffset = new Point(0, 0);
        }

        this.clippingGroup = new Group([
          this.objectClippingMask,
          this.object,
          this.objectNightShade
        ]);

        this.clippingGroup.clipped = true;

        this.path = new Group([
          this.objectDropShadow,
          this.clippingGroup
        ]);

        this.path.onMouseUp = this.onMouseUp.bind(this);
        this.path.onMouseDrag = this.onMouseDrag.bind(this);

        Canvas.bodies.addChild(this.path);

        Emitter.on('camera:reset', function(evt) {
          if (this_._focused) {
            this_._focused = false;
          }
        });
        this.model.on('update', function() {
          this_.object.scale((this.config.radius / 100 * ratio) / radius);
          this_.object.position = new Point(this.position[0] / 100 * ratio, this.position[1] / 100 * ratio);
          radius = this.config.radius / 100 * ratio;
          this_.focus();
          paper.view.draw();
        });

        Loader.get(this.name).then(function(group) {
          this_.surface = group;
          this_.surfacePaths = drillIntoGroup(this_.surface);

          this_.surface._center = {
            x: this_.surface.bounds.getWidth() / 2,
            y: this_.surface.bounds.getHeight() / 2
          };
          this_.surface.R = this_.surface.bounds.getWidth() / (Math.PI * Math.sqrt(3));

          this_._currentRotation = -20;
          this_._drawSurface();

          this_.surface.scale(this_.objectClippingMask.bounds.getHeight() / this_.surface.bounds.getHeight() * 0.92);
          this_.surface.position.x = this_.path.position.x;
          this_.surface.position.y = this_.path.position.y;

          this_.clippingGroup.insertChild(2, this_.surface);

          this_.surfacePaths.forEach(function(path) {
            path.onMouseUp = function(evt) {
              console.log(this.name);
            };
          });

          this_.surfacePaths.findWhere({name: 'remove'}).remove();
        });
      },
      onMouseDrag: function onMouseDrag(evt) {
        if (this._focused) {
          this._revolve && this._revolve();
          this._currentRotation += evt.delta.x;
          this._drawSurface();
        }
      },
      _projectionToCartisian: function _projectionToCartisian(point) {
        var x_0 = point.original_x - this.surface._center.x,
          y_0 = this.surface._center.y - point.original_y,
          λ = (2 * Math.PI * x_0) / (3 * this.surface.R * Math.sqrt((Math.PI * Math.PI / 3) - Math.pow(y_0 / this.surface.R, 2))),
          φ = y_0 / this.surface.R;

        var rotation = λ + Math.PI / 3 + (this._currentRotation / 63 * Math.PI);

        return {
          x: this.surface.R * Math.cos(φ) * Math.cos(rotation),
          y: this.surface.R * Math.cos(φ) * Math.sin(rotation),
          z: this.surface.R * Math.sin(φ)
        };
      },
      _drawSurface: function _drawSurface() {
        if (!this.surface)
            return false;

        var this_ = this,
          groups = {};

        this.surfacePaths.forEach(function(path) {
          path.visible = true;
          var westCoords = this_._projectionToCartisian(path._westPoint), 
            eastCoords = this_._projectionToCartisian(path._eastPoint),
            bias = -1;

          if (westCoords.x > 0 && eastCoords.x < 0) {
            bias = 1;
          } else if (westCoords.x < 0 && eastCoords.x < 0) {
            path.visible = false;
          }

          path.segments.pluck('point').forEach(function(point) {
            coords = this_._projectionToCartisian(point);
            if (coords.x > 0) {
              point.x = coords.y;
            } else {
              point.x = Math.sqrt(this_.surface.R * this_.surface.R - coords.z * coords.z) * bias;
            }
            point.y = this_.surface._center.y - coords.z;
          });
          // path.curves.forEach(function(curve) {
          //   curve.handle1
          //   curve.handle2
          // });
        });
      },
      onMouseUp: function onMouseUp(evt) {
        var this_ = this;

        if (this._focused)
          return false;

        Canvas.focusCamera(this.object.position, 15 / this.model.config.radius);
        this._focused = true;

        // this._revolve = Emitter.onFrame(function(time) {
        //   this_._currentRotation = time / 250;
        //   this_._drawSurface();
        // });
      },
      focus: function focus() {
        this.onMouseUp();
      }
    });
  }]);