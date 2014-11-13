angular.module('Map', [])
  .service('Map', ['$parse', 'Base', function($parse, Base) {
    var EYE_DISTANCE = 6;

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
        this.path.position.y = this.destinationBounds.centerY - 2.5;
        
        this._update();

        this.paths.findWhere({name: 'remove'}).remove();
        placeholder.remove();
      },
      _setProjectionConstants: function _setProjectionConstants() {
        //# must return {x, y, factor} (a disproportionate scale factor)
      },
      _mapProjectionToSpherical: function _mapProjectionToSpherical(point) {
        //# must set point.λ and point.φ
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
          this_.setRotation(time / 800);
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
            // path.flatten(5);
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
        // http://www.progonos.com/furuti/MapProj/Normal/CartHow/HowKav7/howKav7.html
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