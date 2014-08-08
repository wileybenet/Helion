angular.module('Canvas', [])
  .service('Canvas', [function() {
    return {
      '$init': function() {
        var canvas = document.getElementById('main-canvas'),
          layer;
        paper.setup(canvas);
        this.background = project.activeLayer;
        this.background.name = 'background';
        this.tracks = new Layer();
        this.tracks.name = 'tracks';
        this.movers = new Layer();
        this.movers.name = 'movers';
        this.bodies = new Layer();
        this.bodies.name = 'bodies';
        this.testing = new Layer();
        this.testing.name = 'testing';
      }
    };
  }]);