angular.module('Body', [])
  .service('Body', ['Base', 'Resource', 'Emitter', 'Loader', 'Canvas', 'Utils', function(Base, Resource, Emitter, Loader, Canvas, Utils) {
    var endpoint = '/api/v1/body/:id',
      crudApi = Resource(endpoint, {}, {});

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
        this.styles = {};
        this.object = new Path.Circle({
          radius: radius,
          center: new Point(model.position[0] / 100 * ratio, model.position[1] / 100 * ratio),
          shadowColor: '#000',
          shadowBlur: 6,
          shadowOffset: new Point(5, 5)
        });
        this.model.on('update', function() {
          this_.object.scale((this.config.radius / 100 * ratio) / radius);
          this_.object.position = new Point(this.position[0] / 100 * ratio, this.position[1] / 100 * ratio);
          radius = this.config.radius / 100 * ratio;
          this_.focus();
          paper.view.draw();
        });
        this.object.fillColor = {
          gradient: {
            stops: [
              [Utils.luminosity(options.fill, 0.2), 0.05],
              [Utils.luminosity(options.fill, -0.1), 0.3],
              [Utils.luminosity(options.fill, -0.5), 0.7],
              ['#000', 1]
            ],
            radial: true
          },
          origin: [this.object.position.x-(radius*0.5), this.object.position.y],
          destination: this.object.bounds.rightCenter,
        };

        if (options.stroke) {
          this.object.strokeColor = Utils.luminosity(options.stroke, -0.3);
          this.object.strokeWidth = options.strokeWidth || 1;
          this.object.srokeOpacity = options.strokeOpacity || 0.5;
          this.object.shadowColor = Utils.luminosity(options.shadow || options.stroke, 0);
          this.object.shadowBlur = 30;
          this.object.shadowOffset = new Point(0, 0);
          this.styles.strokeColor = this.object.strokeColor;
        }

        this._listeners = {
          move: [],
          scale: []
        };

        this.path = new Group([this.object]);

        this.path.onMouseUp = this.onMouseUp.bind(this);

        Canvas.bodies.addChild(this.path);

        Emitter.on('camera:reset', function(evt) {
          if (this_.surface) {
            this_.surface.remove();
            delete this_.surface;
          }
        });
      },
      onMouseUp: function onMouseUp(evt) {
        var this_ = this;

        Canvas.focusCamera(this.object.position, 20 / this.model.config.radius);

        Loader.get('eris', function(group) {
          group.scale(this_.path.bounds.getWidth() / group.bounds.getWidth());
          group.position.x = this_.path.position.x;
          group.position.y = this_.path.position.y;
          this_.path.addChild(group);
          this_.surface = group;
        });
      },
      focus: function focus() {
        this.onMouseUp();
      },
      _trigger: function _trigger(evt, data) {
        this._listeners[evt].forEach(function(fn) {
          fn(data);
        });
      },
      on: function on(evt, cbFn) {
        this._listeners[evt].push(cbFn);
      }
    });
  }]);