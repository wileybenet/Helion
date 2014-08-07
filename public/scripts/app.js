angular.module('Helion', ['ngResource', 'Body', 'Mover', 'Canvas', 'Collection', 'System', 'Utilities'])
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
  .controller('CanvasCtrl', ['$scope', '$q', 'Collection', 'Body', 'Mover', 'Canvas', 'System', 'Bus',
  function($scope, $q, Collection, Body, Mover, Canvas, System, Bus) {
    Canvas.$init();
    Bus.$init();
    Bus.onData(function(data) {
      for (var key in data) {
        $scope[key] = data[key];
      }
      $scope.$digest();
    });

    $q.all({
      collections: Collection.query().$promise,
      bodies: Body.query().$promise
    }).then(function(res) {
      var bodies = res.bodies.groupBy('collection'),
        collections = res.collections.map(function(collection) {
          return new Collection(collection.name, bodies[collection.name].map(function(body) {
            return new Body(body.name, body);
          }));
        });
      System.create(collections);

      new Mover(System.Eris.Eris, {fixed: 0.4})
        .setWaypoints([System.Mir.Mir]).start('bounce');
      new Mover(System.Eris.Eris, {fixed: 0.4})
        .setWaypoints([System.Mir.Mir, System.Mir.Aqx]).start('bounce');
      new Mover(System.Eris.Eris, {fixed: [-0.4, 0.2, 0.3], layover: 1})
        .setWaypoints([System.Eris.Maria, System.Eris.Jorah]).start('loop');

      paper.view.draw();
      $scope.canvasLoaded = true;
    });
  }]);