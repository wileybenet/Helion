angular.module('Body', [])
  .service('Body', ['Utils', function(Utils) {
    function Body(name, coords, radius, options) {
      var this_ = this,
        path = new Path.Circle({
          radius: radius,
          center: coords,
          shadowColor: '#000',
          shadowBlur: 6,
          shadowOffset: new Point(5, 5)
        });
      path.fillColor = {
        gradient: {
          stops: [
            [Utils.luminosity(options.fill, 0.2), 0.05],
            [Utils.luminosity(options.fill, -0.1), 0.3],
            [Utils.luminosity(options.fill, -0.5), 0.7], ['#000', 1]
          ],
          radial: true
        },
        origin: [path.position.x-(radius*0.5), path.position.y],
        destination: path.bounds.rightCenter,
      };

      if (options.stroke) {
        path.strokeColor = Utils.luminosity(options.stroke, -0.3);
        path.strokeWidth = options.strokeWidth || 1;
        path.srokeOpacity = options.strokeOpacity || 0.5;
        path.shadowColor = Utils.luminosity(options.shadow || options.stroke, 0);
        path.shadowBlur = 30;
        path.shadowOffset = new Point(0, 0);
      }

      this.title = new PointText({
        point: path.bounds.topCenter.add([0, -10]),
        justification: 'center',
        fontSize: 10,
        content: name
      });
      this._label = new PointText({
        point: path.bounds.center,
        justification: 'center',
        fontSize: 8,
        fillColor: 'white'
      });

      this._listeners = {
        move: [],
        scale: []
      };

      this.path = new Group([path, this.title, this._label]);

      this.path.onMouseDown = this.onMouseDown.bind(this);
      this.path.onMouseDrag = this.onMouseDrag.bind(this);
      this.path.onMouseUp = this.onMouseUp.bind(this);

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
      // console.log('up', this);
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