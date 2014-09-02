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
  .controller('CanvasCtrl', ['$scope', '$rootScope', '$q', 'Body', 'Mover', 'Canvas', 'System',
  function($scope, $rootScope, $q, Body, Mover, Canvas, System) {
    Canvas.$init();

    $q.all({
      bodies: Body.all().$promise,
      movers: Mover.all().$promise
    }).then(function(res) {
      var bodies = res.bodies.map(function(body) {
        return new Body(body);
      });
      System.create(bodies);

      res.movers.forEach(function(mover) {
        new Mover(mover);
      });

      paper.view.draw();
      $scope.canvasLoaded = true;
    });
  }]);


