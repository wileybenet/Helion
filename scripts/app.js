(function(Body, Collection) {
  window.onload = function() {
    var canvas = document.getElementById('main-canvas');

    paper.setup(canvas);

    new Collection('Eris', [
      new Body([700, 293], 33, {fill: '1aff1a', stroke: '33ffff'}),
      new Body([657, 373], 18, {fill: '1aff1a'}),
      new Body([788, 325], 14, {fill: '1aff1a'})
    ]);

  };

  window.onFrame = function(evt) {

  };


}(Helion.Body, Helion.Collection))