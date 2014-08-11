angular.module('directives', [])  
  .directive('canvasPopup', ['$timeout', function($timeout) {
    return {
      template: [
        '<span class="close stop-hover" data-ng-click="data.model = null">',
          '<i class="fa fa-times"></i>',
        '</span>',
        '<h4 data-edit="data.model" data-field="name" data-ng-class="{flipped: flipped, normal: !flipped}">',
          '<i class="fa fa-globe"></i> {{data.model.name}}',
        '</h4>',
        '<div class="body" data-edit="data.model" data-field="description">',
          '<span data-ng-bind-html="data.model.description | htmlFormatted"></span>',
        '</div>',
        '<div class="footer">',
          'Footer',
        '</div>'
      ].join(''),
      scope: {
        data: '=canvasPopup'
      },
      link: function(scope, element, attrs) {
        scope.$watch('data', function() {
          $timeout(function() {
            var top = Math.min($(window).height() - element.height() - 20, scope.data.y),
              left = scope.data.x;
            if (scope.flipped = $(window).width() - 260 < left) {
              left = scope.data.x - scope.data.dx - 260;
            }
            element.css({
              top: top + 'px',
              left: left + 'px'
            });
          });
        }, true);
      }
    };
  }])
  .directive('edit', ['$rootScope', '$timeout', '$document', function($rootScope, $timeout, $document) {
    return {
      transclude: true,
      template: [
        '<div class="modal-drop" data-ng-hide="!editing" data-ng-click="editing = false">',
          '<div class="modal" data-ng-click="stop($event)">',
            '<div class="close stop-hover" data-ng-click="value = model[field]; editing = false">',
              '<i class="fa fa-times"></i>',
            '</div>',
            '<div class="heading">',
              '<i class="fa fa-pencil"></i> <em>{{field | capitalizeFirstLetter}}</em>',
            '</div>',
            '<div class="body">',
              '<form name="form">',
                '<textarea name="field" class="input-field" data-ng-model="value" data-ng-style="{height: getHeight(value)+\'px\'}"></textarea>',
              '</form>',
            '</div>',
            '<div class="footer" data-ng-hide="!form.field.$dirty">',
              '<i class="fa fa-times stop" data-ng-click="value = model[field]; editing = false"></i>',
              '<i class="go fa fa-check-square-o" data-ng-click="model[field] = value; promise = model.$update()"></i>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="edit-wrapper">',
          '<span data-ng-transclude></span>',
          '<i class="fa fa-pencil" data-ng-if="hover"></i>',
        '</div>'
      ].join(''),
      scope: {
        model: '=edit'
      },
      link: function(scope, element, attrs) {
        scope.promise = null;
        scope.$watch('editing', function(state) {
          if (state)
            $timeout(function() {
              element.find('textarea').focus();
            });
        });
        scope.$watch('editing', function() {
          scope.field = attrs.field;
          scope.value = (scope.model || {})[attrs.field];
        }, true);
        scope.$watch('promise', function(promise) {
          if (promise) {
            scope.editing = false;
            $rootScope.saving = true;
            promise.then(function() {
              $rootScope.saving = false;
            });
          }
        });

        scope.getHeight = function(str) {
          return Math.floor((str || '').length / 30) * 22 + 30;
        };

        scope.stop = function(evt) {
          evt.stopPropagation();
        }

        element.on('click', function(evt) {
          if (evt.shiftKey) {
            scope.$apply(function() {
              scope.editing = true;
            });
          }
        });
        element.on('dblclick', function(evt) {
          scope.$apply(function() {
            scope.editing = true;
          });
        });

        element.on('mouseenter mousemove', function(evt) {
          scope.$apply(function() {
            if (evt.shiftKey) {
              scope.hover = true;
            } else {
              scope.hover = false;
            }
          });
        });
        element.on('mouseleave', function(evt) {
          scope.$apply(function() {
            scope.hover = false;
          });
        });

        $document.on('keyup', function(evt) {
          if (evt.keyCode === 27) {
            scope.$apply(function() {
              scope.editing = false;
            });
          }
        });
      }
    };
  }]);