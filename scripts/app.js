angular.module('Helion', ['Body', 'Canvas', 'Collection', 'Utils'])
  .config([function() {
    paper.install(window);
  }])
  .directive('canvas', ['Collection', 'Body', 'Canvas', function(Collection, Body, Canvas) {
    return {
      link: function(scope, element, attrs) {
        var canvas = document.getElementById('main-canvas');
        paper.setup(canvas);

        Canvas.init();

        new Collection('Alkon', [
          new Body('Alkon', [100, 100], 29, {fill: '4ca6ff'}),
          new Body('Zola', [100, 200], 19, {fill: '4ca6ff'}),
          new Body('alpha', [100, 300], 6, {fill: '4ca6ff'}),
          new Body('beta', [100, 400], 4, {fill: '4ca6ff'})
        ]);

        new Collection('Prime', [
          new Body('Prime', [402, 369], 34, {fill: '1fff8f', stroke: '33ffff'})
        ]);

        new Collection('Eris', [
          new Body('Eris', [600, 293], 33, {fill: '1aff1a', stroke: '33ffff'}),
          new Body('Faun', [557, 373], 18, {fill: '1aff1a'}),
          new Body('Pan', [688, 325], 14, {fill: '1aff1a'})
        ]);

        new Collection('Jorah', [
          new Body('Jorah', [917, 549], 70, {fill: 'ffa64e'}),
          new Body('Mir', [763, 563], 24, {fill: 'ffa64e'}),
          new Body('Aqx', [841, 393], 20, {fill: 'ffa64e', stroke: '33ffff'})
        ]);
      }
    };
  }]);