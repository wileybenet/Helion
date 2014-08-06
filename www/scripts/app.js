angular.module('Helion', ['Body', 'Mover', 'Canvas', 'Collection', 'System', 'Utilities'])
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
  .controller('CanvasCtrl', ['$scope', 'Collection', 'Body', 'Mover', 'Canvas', 'System', 'Bus',
  function($scope, Collection, Body, Mover, Canvas, System, Bus) {
    Canvas.$init();
    Bus.$init();
    Bus.onData(function(data) {
      for (var key in data) {
        $scope[key] = data[key];
      }
      $scope.$digest();
    });

    System.create([
      new Collection('Ferux', [
        new Body('Ferux', [170, 180], 14, {fill: 'ff5151'}),
        new Body('a', [190, 230], 3, {fill: 'ff5151'})
      ]),
      new Collection('Alkon', [
        new Body('Alkon', [321, 366], 25, {fill: '4ca6ff'}),
        new Body('Zola', [361, 272], 16, {fill: '4ca6ff'}),
        new Body('b', [264, 418], 6, {fill: '4ca6ff'}),
        new Body('c', [236, 374], 4, {fill: '4ca6ff'})
      ]),
      new Collection('Prime', [
        new Body('Prime', [452, 209], 34, {fill: '1fff8f', stroke: '33ffff'})
      ]),
      new Collection('Eris', [
        new Body('Eris', [600, 173], 31, {fill: '1aff1a', stroke: '33ffff'}),
        new Body('Maria', [567, 253], 18, {fill: '1aff1a'}),
        new Body('Jorah', [688, 205], 14, {fill: '1aff1a'})
      ], {
        info: 'This is a test of the group contextual info feature.'
      }),
      new Collection('Mir', [
        new Body('Mir', [897, 449], 70, {fill: 'ff8000'}),
        new Body('Nepali', [743, 463], 24, {fill: 'ff8000'}),
        new Body('Aqx', [821, 333], 20, {fill: 'ff8000', stroke: '33ffff'})
      ]),
      new Collection('Rome', [
        new Body('Rome', [1300, 275], 25, {fill: 'b100b1'}),
        new Body('Kassel', [1250, 325], 25, {fill: 'b100b1'})
      ])
    ]);

    new Mover(System.Eris.Eris, {fixed: 0.4})
      .setWaypoints([System.Mir.Mir]).start('bounce');
    new Mover(System.Eris.Eris, {fixed: 0.4})
      .setWaypoints([System.Mir.Mir, System.Mir.Aqx]).start('bounce');
    new Mover(System.Eris.Eris, {fixed: [-0.4, 0.2, 0.3], layover: 1})
      .setWaypoints([System.Eris.Maria, System.Eris.Jorah]).start('loop');


    paper.view.draw();
  }]);