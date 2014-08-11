angular.module('Body', [])
  .service('Body', ['$resource', 'Bus', 'Canvas', 'Utils', function($resource, Bus, Canvas, Utils) {
    var resource = $resource('/api/v1/body/:id', {}, {
      update: {
        method: 'PUT'
      }
    });
    window.utils = Utils;
    function Body(name, config) {
      var this_ = this,
        options = config.options || {};

      this.model = new (resource.bind({id: config._id}))(config);

      this.name = name;
      this.color = Utils.luminosity(options.fill, 0);
      this.styles = {};
      this.object = new Path.Circle({
        radius: config.radius,
        center: config.position,
        shadowColor: '#000',
        shadowBlur: 6,
        shadowOffset: new Point(5, 5)
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
        origin: [this.object.position.x-(config.radius*0.5), this.object.position.y],
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

      this.path.onMouseDown = this.onMouseDown.bind(this);
      this.path.onMouseDrag = this.onMouseDrag.bind(this);
      this.path.onMouseUp = this.onMouseUp.bind(this);
      this.path.onMouseEnter = this.onMouseEnter.bind(this);
      this.path.onMouseLeave = this.onMouseLeave.bind(this);

      Canvas.bodies.addChild(this.path);
    };

    Body.prototype.onMouseDown = function(evt) {
      // console.log('down', this);
    };

    Body.prototype.onMouseDrag = function(evt) {
      this.path.position.x = this.path.position.x + evt.delta.x;
      this.path.position.y = this.path.position.y + evt.delta.y;
      this._label.content = this.path.position.x+', '+this.path.position.y;
      this._trigger('move', this.path);
    };

    Body.prototype.onMouseUp = function(evt) {
      var position = this.object.bounds.topRight.add(10, -20);
      Bus.push({
        popupInfo: {
          x: position.x,
          y: position.y,
          dx: this.object.bounds.width + 20,
          model: this.model
        }
      });
      window.model = this.model;
    };

    Body.prototype.onMouseEnter = function(evt) {
      this.highlight(true);
    };

    Body.prototype.onMouseLeave = function(evt) {
      this.highlight();
    };

    Body.prototype.highlight = function(state) {
      // this.object.strokeColor = state ? '#F00' : this.styles.strokeColor;
    };

    Body.prototype._trigger = function(evt, data) {
      this._listeners[evt].forEach(function(fn) {
        fn(data);
      });
    };

    Body.prototype.on = function(evt, cbFn) {
      this._listeners[evt].push(cbFn);
    };

    Body.query = resource.query;
    Body.save = Body.save;

    return Body;
  }]);