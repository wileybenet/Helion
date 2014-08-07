angular.module('Canvas', [])
  .service('Canvas', [function() {
    return {
      '$init': function() {
        var canvas = document.getElementById('main-canvas'),
          layer;
        paper.setup(canvas);
        this.background = project.activeLayer;
        this.background.name = 'background';
        this.movers = new Layer();
        this.movers.name = 'movers';
        this.bodies = new Layer();
        this.bodies.name = 'bodies';
        this.testing = new Layer();
        this.testing.name = 'testing';
      }
    };
  }])
  .directive('canvasPopup', [function() {
    return {
      template: [
        '<div class="popup-close action" data-ng-click="data.model = null">',
          '<i class="fa fa-times"></i>',
        '</div>',
        '<h4>',
          '{{data.model.name}}',
        '</h4>',
        '<div class="popup-body">',
          '{{data.model.description}}',
        '</div>'
      ].join(''),
      scope: {
        data: '=canvasPopup'
      },
      link: function(scope, element, attrs) {
      }
    };
  }]);