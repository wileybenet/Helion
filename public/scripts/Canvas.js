angular.module('Canvas', [])
  .service('Canvas', ['Emitter', function(Emitter) {
    return {
      '$init': function() {
        var this_ = this,
          canvas = document.getElementById('main-canvas'),
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

        $(document).on('keyup', function(evt) {
          if (evt.keyCode === 27) {
            this_.resetCamera();
          }
        });
      },
      focusCamera: function(location, zoom, stepFn, cbFn) {
        var x_0 = view.center.x,
          x_1 = location.x,
          dx = x_1 - x_0,
          y_0 = view.center.y,
          y_1 = location.y,
          dy = y_1 - y_0,
          z_0 = view.zoom,
          z_1 = zoom,
          dz = z_1 - z_0;

        Emitter.animate('canvas', function(position) {
          view.setCenter([
            x_0 + (dx - (dx * (1 - position)) / (dz * position + z_0)),
            y_0 + (dy - (dy * (1 - position)) / (dz * position + z_0))
          ]);
          view.setZoom(z_0 + dz * position);
          stepFn(position);
        }, 500, 'easeInOutSine', function() {
          cbFn();
        });
      },
      resetCamera: function() {
        var x_0 = view.center.x,
          x_1 = $(window).width() / 2,
          dx = x_1 - x_0,
          y_0 = view.center.y,
          y_1 = $(window).height() / 2,
          dy = y_1 - y_0,
          z_0 = view.zoom,
          z_1 = 1,
          dz = z_1 - z_0;

        Emitter.animate('canvas', function(position) {
          view.setCenter([
            x_0 + (dx * position) / (dz * position + z_0),
            y_0 + (dy * position) / (dz * position + z_0)
          ]);
          view.setZoom(z_0 + dz * position);
        }, 500, 'easeInOutCubic');

        Emitter.emit('camera:reset', {});
      }
    };
  }]);