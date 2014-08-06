angular.module('Canvas', [])
  .service('Canvas', [function() {
    return {
      newLayer: function(name) {
        var layer = new Layer();
        layer.name = name;
        return name;
      },
      init: function() {
        var canvas = document.getElementById('main-canvas'),
          layer;
        paper.setup(canvas);
        layer = project.activeLayer;
        project.activeLayer.name = 'layer_1';
        this.background = new Layer();
        this.background.name = 'background';
        project.layers.reverse();
        layer.activate();
      }
    };
  }]);