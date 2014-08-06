angular.module('Helion', ['Body', 'Canvas', 'Collection', 'Utils'])
  .config([function() {
    paper.install(window);
    var tool = new Tool();
    tool.onMouseMove = function(evt) {
      console.log(evt.item);
      if (evt.item && evt.item.pointer) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'auto';
      }
    };
  }])
  .directive('canvas', ['Collection', 'Body', 'Canvas', function(Collection, Body, Canvas) {
    return {
      link: function(scope, element, attrs) {
        Canvas.init();

        new Collection('Ferux', [
          new Body('Ferux', [170, 180], 14, {fill: 'ff5151'}),
          new Body('alpha', [190, 230], 3, {fill: 'ff5151'})
        ]);

        new Collection('Alkon', [
          new Body('Alkon', [321, 366], 25, {fill: '4ca6ff'}),
          new Body('Zola', [361, 272], 16, {fill: '4ca6ff'}),
          new Body('alpha', [264, 418], 6, {fill: '4ca6ff'}),
          new Body('beta', [236, 374], 4, {fill: '4ca6ff'})
        ]);

        new Collection('Prime', [
          new Body('Prime', [452, 209], 34, {fill: '1fff8f', stroke: '33ffff'})
        ]);

        new Collection('Eris', [
          new Body('Eris', [600, 173], 31, {fill: '1aff1a', stroke: '33ffff'}),
          new Body('Maria', [567, 253], 18, {fill: '1aff1a'}),
          new Body('Jorah', [688, 205], 14, {fill: '1aff1a'})
        ]);

        new Collection('Mir', [
          new Body('Mir', [897, 449], 70, {fill: 'ff8000'}),
          new Body('Nepali', [743, 463], 24, {fill: 'ff8000'}),
          new Body('Aqx', [821, 333], 20, {fill: 'ff8000', stroke: '33ffff'})
        ]);

        new Collection('Rome', [
          new Body('Rome', [1300, 275], 25, {fill: 'b100b1'})
        ]);

        paper.view.draw();
      }
    };
  }]);