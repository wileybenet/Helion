(function(Utils) {
  var getBounds = function(paths) {
    return 'Bounds';
  };

  Helion.Collection = function(name, bodies) {
    this.name = name;
    this.bounds = getBounds(bodies.pluck('path'));
    this.paths = new Group(bodies.pluck('path'));
  };

}(window.Utils))