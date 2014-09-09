angular.module('Body', [])
  .service('Body', ['Base', 'Map', 'Resource', 'Emitter', 'Loader', 'Canvas', 'Utils',
  function(Base, Map, Resource, Emitter, Loader, Canvas, Utils) {
    var endpoint = '/api/v1/body/:id',
      crudApi = Resource(endpoint, {}, {}),
      groupId = 0;

    return Base.extend({
      all: crudApi.query,
      create: crudApi.save
    }, {
      initialize: function Body(model) {
        if (!model)
          return;
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

        // this.clippingGroup.clipped = true;

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
          this_.objectNightShade.visible = true;
          this_.objectNightShade.fillColor.gradient.stops = [
            new Color(0,0,0,0),
            new Color(0,0,0,0.3),
            new Color(0,0,0,0.7),
            new Color(0,0,0,1)
          ];
          this_.map && this_.map.stop && this_.map.stop();
        });
        this.model.on('update', function() {
          this_.object.scale((this.config.radius / 100 * ratio) / radius);
          this_.object.position = new Point(this.position[0] / 100 * ratio, this.position[1] / 100 * ratio);
          radius = this.config.radius / 100 * ratio;
          this_.focus();
          paper.view.draw();
        });

        Loader.get(this.name).then(function(group) {
          this_.map = new Map.KavrayskiyVII(group, this_.object.clone());
          this_.clippingGroup.insertChild(2, this_.map.path);
        });
      },
      onMouseDrag: function onMouseDrag(evt) {
        if (this._focused) {
          this.map.stop && this.map.stop();
          this.map.rotate(evt.delta.x);
        }
      },
      onMouseUp: function onMouseUp(evt) {
        var this_ = this;

        if (this._focused)
          return false;

        Canvas.focusCamera(this.object.position, 15 / this.model.config.radius, function(position) {
          this_.objectNightShade.fillColor.gradient.stops = [
            new Color(0,0,0,0),
            new Color(0,0,0,0.3 - 0.3 * position),
            new Color(0,0,0,0.7 - 0.7 * position),
            new Color(0,0,0,1 - position)
          ];
        }, function() {
          this_.objectNightShade.visible = false;
        });
        this._focused = true;

        // this.map.revolve();
      },
      focus: function focus() {
        this.onMouseUp();
      }
    });
  }])
  .service('Map', ['$parse', 'Base', function($parse, Base) {
    var EYE_DISTANCE = 10;

    var Map = Base.extend({
      initialize: function Map(projectedGroup, placeholder) {
        this.path = projectedGroup;
        this.projection = projectedGroup.clone();
        this.projection.visible = false;
        this.destinationBounds = placeholder.bounds;
        this.constants = this._setProjectionConstants(this.path.bounds);
        this._currentRotation = 0;

        this.constants.thresholdφ = Math.PI / 2 - Math.acos(1 / EYE_DISTANCE);
        this.constants.scaleFactor = Math.cos(this.constants.thresholdφ);

        this.paths = this._formatPaths(this.path);

        this.path.position.x = this.destinationBounds.centerX;
        this.path.position.y = this.destinationBounds.centerY;
        
        this._update();

        this.paths.findWhere({name: 'remove'}).remove();
        placeholder.remove();
      },
      _setProjectionConstants: function _setProjectionConstants() {
        // must return {x, y, factor} (a disproportionate scale factor)
      },
      _mapProjectionToSpherical: function _mapProjectionToSpherical(point) {
        // must set point.λ and point.φ
      },
      _update: function _update() {
        var this_ = this;
        this.paths.forEach(function(path) {
          path.visible = true;
          var centerCoords = this_._transformSphericalToViewport(path),
            bias = centerCoords.λ > 0 ? 1 : -1,
            allHidden = true;

          path.segments.pluck('point').forEach(function(point) {
            var coords = this_._transformSphericalToViewport(point, bias);

            if (point.visible) {
              allHidden = false;
            }

            point.x = -coords.y;
            point.y = coords.x;
          });

          path.visible = !allHidden;
        });
      },
      revolve: function revolve() {
        var this_ = this;
        this.stop = this.onFrame(function(time) {
          this_.setRotation(time / 2000);
        });
      },
      setRotation: function setRotation(pixelDistance) {
        this._currentRotation = pixelDistance;
        this._update();
      },
      rotate: function rotate(pixelDelta) {
        this._currentRotation += pixelDelta;
        this._update();
      },
      getRotation: function getRotation() {
        return this._currentRotation / this.destinationBounds.width * 180;
      },
      _transformSphericalToViewport: function _transformSphericalToViewport(point, bias) {
        var coords = this._transformSphericalToCartesian(point, bias),
          xi = coords.x * EYE_DISTANCE / (EYE_DISTANCE - coords.z),
          yi = coords.y * EYE_DISTANCE / (EYE_DISTANCE - coords.z);

        return {
          x: xi * point.R * this.constants.scaleFactor,
          y: yi * point.R * this.constants.scaleFactor,
          λ: coords.λ,
          φ: coords.φ
        }
      },
      _transformSphericalToCartesian: function _transformSphericalToCartesian(point, bias) {
        var finalCoords,
          sphericalCoords = this._sphericalTranform(point);
        sphericalCoords.R = point.R;

        point.visible = true;
        if (sphericalCoords.φ < this.constants.thresholdφ && bias) {
          sphericalCoords.φ = this.constants.thresholdφ;
          sphericalCoords.λ = Math.abs(sphericalCoords.λ) * bias;
          point.visible = false;
        }

        finalCoords = this._sphericalToCartesian(sphericalCoords);
        finalCoords.λ = sphericalCoords.λ;
        finalCoords.φ = sphericalCoords.φ;
        return finalCoords;
      },
      _sphericalTranform: function _sphericalTranform(point) {
        var coords = this._sphericalToCartesian(point, this._currentRotation);
        return {
          λ: Math.atan2(coords.x, coords.z),
          φ: Math.atan2(coords.y, Math.sqrt(coords.z * coords.z + coords.x * coords.x))
        };
      },
      _sphericalToCartesian: function _sphericalToCartesian(point, rotation) {
        var newλ = rotation ? (point.λ + (rotation / point.R / 2 * Math.PI)) : point.λ;
        return {
          x: Math.cos(point.φ) * Math.cos(newλ),
          y: Math.cos(point.φ) * Math.sin(newλ),
          z: Math.sin(point.φ)
        };
      },
      _setRadius: function _setRadius(point) {
        point.R = this.destinationBounds.width / 2;
      },
      _formatPaths: function _formatPaths(group) {
        var this_ = this,
          paths = [];
        group.children.forEach(function(path) {
          var newPath,
            westPoint, eastPoint;
          if (path instanceof Shape) {
            newPath = path.toPath();
            path.remove();
            path = newPath;
          }
          if (path.children && path.children.length > 0) {
            paths = paths.concat(this_._formatPaths(path));
          } else {
            path.flatten(10);
            path.segments.pluck('point').forEach(function(point) {
              point.x = point.x - this_.constants.x;
              point.y *= this_.constants.factor;
              point.y = point.y - this_.constants.y;
              this_._setRadius(point);
              this_._mapProjectionToSpherical(point);
            });
            this_._setRadius(path);
            this_._mapProjectionToSpherical(path, 'bounds.centerX', 'bounds.centerY');
            paths.push(path);

            path.onMouseUp = function(evt) {
              console.log(this.name);
            };
          }
        });
        return paths;
      }
    });

    return {
      KavrayskiyVII: Map.extend({
        initialize: function KavrayskiyVII() {
          this.$uper.constructor.apply(this, arguments);
          // http://www.progonos.com/furuti/MapProj/Normal/CartHow/HowKav7/howKav7.html
        },
        _setProjectionConstants: function _setProjectionConstants(bounds) {
          var W = bounds.width / 4,
            H = Math.sqrt(4 / 3) * W;
          return {
            x: 4 * W / 2 + bounds.x,
            y: 2 * H / 2 + bounds.y + 2.5,
            R: 4 * W / (Math.PI * Math.sqrt(3)),
            factor: 2 * H / bounds.height
          };
        },
        _mapProjectionToSpherical: function _mapProjectionToSpherical(point, x, y) {
          var x_0 = x ? $parse(x)(point) : point.x,
            y_0 = y ? $parse(y)(point) : point.y;
          point.λ = (2 * Math.PI * x_0) / (3 * this.constants.R * Math.sqrt((Math.PI * Math.PI / 3) - Math.pow(y_0 / this.constants.R, 2)));
          point.φ = y_0 / this.constants.R;
        }
      })
    }
  }]);