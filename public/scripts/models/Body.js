angular.module('Body', [])
  .service('Body', ['Base', 'Resource', 'Bus', 'Canvas', 'Utils', function(Base, Resource, Bus, Canvas, Utils) {
    var endpoint = '/api/v1/body/:id',
      createReadApi = Resource(endpoint, {}, {});

    return Base.extend({
      all: createReadApi.query,
      create: createReadApi.save
    }, {
      initialize: function Body(model) {
        var this_ = this,
          radius = model.radius,
          options = model.config || {},
          resource = Resource(endpoint, { id: '@_id' }, {});

        this.model = new resource(model);

        this.name = model.name;
        this.color = Utils.luminosity(options.fill, 0);
        this.styles = {};
        this.object = new Path.Circle({
          radius: radius,
          center: model.position,
          shadowColor: '#000',
          shadowBlur: 6,
          shadowOffset: new Point(5, 5)
        });
        this.model.on('update', function() {
          this_.object.scale(this.radius/radius);
          this_.object.position = new Point(this.position[0], this.position[1]);
          radius = this.radius;
          this_.onMouseUp();
          paper.view.draw();
        });
        this.object.fillColor = {
          gradient: {
            stops: [
              [Utils.luminosity(options.fill, 0.2), 0.05],
              [Utils.luminosity(options.fill, -0.1), 0.3],
              [Utils.luminosity(options.fill, -0.5), 0.7], ['#000', 1]
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
        this._label = new PointText({
          point: this.object.bounds.center,
          justification: 'center',
          fontSize: 8,
          fillColor: 'white'
        });

        this._listeners = {
          move: [],
          scale: []
        };

        this.path = new Group([this.object, this._label]);

        this.path.onMouseDrag = this.onMouseDrag.bind(this);
        this.path.onMouseUp = this.onMouseUp.bind(this);

        Canvas.bodies.addChild(this.path);
      },
      onMouseDrag: function onMouseDrag(evt) {
        this.path.position.x = this.path.position.x + evt.delta.x;
        this.path.position.y = this.path.position.y + evt.delta.y;
        this._label.content = this.path.position.x+', '+this.path.position.y;
        this._trigger('move', this.path);
      },
      onMouseUp: function onMouseUp(evt) {
        var position = this.object.bounds.topRight.add(10, -20);
        Bus.push({
          popupInfo: {
            x: position.x,
            y: position.y,
            dx: this.object.bounds.width + 20,
            model: this.model
          }
        });
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