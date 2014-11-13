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
  .controller('CanvasCtrl', ['$scope', '$rootScope', '$q', 'Body', 'Mover', 'Canvas', 'System', 'Loader', 'User',
  function($scope, $rootScope, $q, Body, Mover, Canvas, System, Loader, User) {
    $q.all({
      bodies: Body.all().$promise,
      movers: Mover.all().$promise,
      eris: Loader.get('eris'),
      mir: Loader.get('mir')
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

      setTimeout(function() {
        $('#main-canvas').fadeTo('fast', 1);
      }, 0);
    });
  }]);


