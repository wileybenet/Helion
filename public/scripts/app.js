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
  .controller('CanvasCtrl', ['$scope', '$q', 'Body', 'Mover', 'Canvas', 'System', 'Bus',
  function($scope, $q, Body, Mover, Canvas, System, Bus) {
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

    $(document).on('keyup', function(evt) {
      $scope.$apply(function() {
        if (evt.keyCode === 27) {
          view.setCenter([$(window).width() / 2, $(window).height() / 2]);
          view.zoom = 1;
        }
      }); 
    });

    $scope.$watch('center', function(center) {
      if (!center)
        return false;
      var startCenter = view.center,
        startZ = view.zoom,
        dx = center.x - view.center.x,
        dy = center.y - view.center.y,
        dz = 2 - startZ;
      Bus.animate(function(percentComplete) {
        view.setCenter([startCenter.x + dx * percentComplete, startCenter.y + dy * percentComplete]);
        view.zoom = startZ + dz * percentComplete;
      }, 1300, 'easeOutCubic');
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
      new Mover(System.Eris, {fixed: [0.4, null]})
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


