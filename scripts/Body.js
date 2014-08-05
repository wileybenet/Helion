(function(Utils) {
  Helion.Body = function(coords, radius, options) {
    var this_ = this;

    this.path = Path.Circle({
      radius: radius,
      center: coords
    });
    this.path.fillColor = {
      gradient: {
        stops: [[Utils.luminosity(options.fill, 0), 0.3], [Utils.luminosity(options.fill, -0.5), 0.7], ['#000', 1]],
        radial: true
      },
      origin: [this.path.position.x-(radius*0.5), this.path.position.y],
      destination: this.path.bounds.rightCenter,
    };

    if (options.stroke) {
      this.path.strokeColor = Utils.luminosity(options.stroke, 0);
      this.path.strokeWidth = options.strokeWidth || 1;
      this.path.srokeOpacity = options.strokeOpacity || 0.5;
    }

    this.context = {
      label: new PointText({
        point: this.path.bounds.topRight,
        justification: 'left',
        fontSize: 10,
        fillColor: 'white'
      })
    };

    this.path.onMouseDown = this.onMouseDown.bind(this);
    this.path.onMouseDrag = this.onMouseDrag.bind(this);
    this.path.onMouseUp = this.onMouseUp.bind(this);

    paper.view.draw();
  };

  Helion.Body.prototype.onMouseDown = function(evt) {
    // console.log('down', this);
  };

  Helion.Body.prototype.onMouseDrag = function(evt) {
    this.path.position.x = this.path.position.x + evt.delta.x;
    this.path.position.y = this.path.position.y + evt.delta.y;
    this.context.label.content = this.path.position.x+', '+this.path.position.y;
    this.context.label.position = this.path.bounds.topRight.add([20, 0]);
  };

  Helion.Body.prototype.onMouseUp = function(evt) {
    // console.log('up', this);
  };

}(window.Utils));