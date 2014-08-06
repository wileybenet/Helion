angular.module('Body', [])
  .service('Body', ['Bus', 'Canvas', 'Utils', function(Bus, Canvas, Utils) {
    function Body(name, coords, radius, options) {
      var this_ = this;

      this.name = name;
      this.styles = {};
      this.object = new Path.Circle({
        radius: radius,
        center: coords,
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

      this.title = new PointText({
        point: this.object.bounds.topCenter.add([0, -10]),
        justification: 'center',
        fontSize: 10,
        content: name
      });
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

      this.path = new Group([this.object, this.title, this._label]);

      this.path.onMouseDown = this.onMouseDown.bind(this);
      this.path.onMouseDrag = this.onMouseDrag.bind(this);
      this.path.onMouseUp = this.onMouseUp.bind(this);
      this.path.onMouseEnter = this.onMouseEnter.bind(this);
      this.path.onMouseLeave = this.onMouseLeave.bind(this);

      Canvas.bodies.addChild(this.path);

      this.toggle();
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
      Bus.push({
        popupInfo: {
          x: this.object.bounds.rightCenter.x,
          y: this.object.bounds.bottomRight.y,
          info: 'Testing delivery methods.'
        }
      });
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

    Body.prototype.toggle = function(state) {
      this.title.fillColor = state ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.4)';
    };

    Body.prototype._trigger = function(evt, data) {
      this._listeners[evt].forEach(function(fn) {
        fn(data);
      });
    };

    Body.prototype.on = function(evt, cbFn) {
      this._listeners[evt].push(cbFn);
    };

    return Body;
  }]);