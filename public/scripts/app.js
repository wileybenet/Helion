angular.module('Helion', ['ngResource', 'core', 'Canvas', 'System', 'Utilities'])
  .config([function() {
    paper.install(window);
    var tool = new Tool();
    tool.onMouseMove = function(evt) {
      if (evt.item instanceof Group) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'auto';
      }
    };
  }])
  .controller('CanvasCtrl', ['$scope', '$rootScope', '$q', 'Body', 'Mover', 'Canvas', 'System', 'Bus',
  function($scope, $rootScope, $q, Body, Mover, Canvas, System, Bus) {
    Canvas.$init();
    Bus.$init();

    Bus.onData(function(data) {
      setTimeout(function() {
        $scope.$apply(function() {
          for (var key in data) {
            $scope[key] = data[key];
          }
        });
      },0);
    });

    $rootScope.resetView = function() {
      var x_0 = view.center.x,
        x_1 = $(window).width() / 2,
        dx = x_1 - x_0,
        y_0 = view.center.y,
        y_1 = $(window).height() / 2,
        dy = y_1 - y_0,
        z_0 = view.zoom,
        z_1 = 1,
        dz = z_1 - z_0;

      Bus.animate('canvas', function(position) {
        view.setCenter([
          x_0 + (dx * position) / (dz * position + z_0),
          y_0 + (dy * position) / (dz * position + z_0)
        ]);
        view.setZoom(z_0 + dz * position);
      }, 500, 'easeOutQuint');

      $scope.center = null;
    };

    $(document).on('keyup', function(evt) {
      if (evt.keyCode === 27) {
        $scope.$apply(function() {
          $rootScope.resetView();
        }); 
      }
    });

    $scope.$watch('center', function(center) {
      if (!center)
        return false;

      var x_0 = view.center.x,
        x_1 = center.x,
        dx = x_1 - x_0,
        y_0 = view.center.y,
        y_1 = center.y,
        dy = y_1 - y_0,
        z_0 = view.zoom,
        z_1 = center.z,
        dz = z_1 - z_0;

      Bus.animate('canvas', function(position) {
        view.setCenter([
          x_0 + (dx - (dx * (1 - position)) / (dz * position + z_0)),
          y_0 + (dy - (dy * (1 - position)) / (dz * position + z_0))
        ]);
        view.setZoom(z_0 + dz * position);
      }, 1000, 'easeOutQuint');

    }, true);

    $q.all({
      bodies: Body.all().$promise
    }).then(function(res) {
      var bodies = res.bodies.map(function(body) {
        return new Body(body);
      });
      System.create(bodies);

      new Mover(System.Mir, {fixed: 0.4})
        .setWaypoints([System.Eris])
        .start('bounce');
      new Mover(System.Eris, {fixed: [0.4, null], speed: 2})
        .setWaypoints([System.Mir, System.Aqx])
        .start('bounce');
      new Mover(System.Mir, {fixed: 0.1})
        .setWaypoints([System.Kassel])
        .start('bounce');
      new Mover(System.Mir, {fixed: -0.3})
        .setWaypoints([System.Alkon])
        .start('bounce');
      new Mover(System.Mir, {})
        .setWaypoints([System.Krasic])
        .start('bounce');
      new Mover(System.Eris, {fixed: [-0.4, 0.2, 0.3], layover: 1})
        .setWaypoints([System.Maria, System.Jorah])
        .start('loop');

      new Mover(System.Krasic, {fixed: 0.15, color: '#0F0'})
        .setWaypoints([System.Earth])
        .start('bounce');

      paper.view.draw();
      $scope.canvasLoaded = true;
    });
  }]);


