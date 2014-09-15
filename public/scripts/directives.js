angular.module('directives', [])  
  .directive('canvasPopup', ['$timeout', function($timeout) {
    return {
      templateUrl: '/html/popup.html',
      scope: {
        data: '=canvasPopup'
      }
    };
  }])
  .directive('edit', ['$rootScope', '$timeout', '$parse', '$document', function($rootScope, $timeout, $parse, $document) {
    return {
      transclude: true,
      template: [
        '<div class="drop-screen" data-ng-hide="!editing" data-ng-click="reset()">',
          '<div class="modal border-one" data-ng-click="stop($event)">',
            '<div class="close stop-hover" data-ng-click="reset()">',
              '<i class="fa fa-times"></i>',
            '</div>',
            '<div class="header">',
              '<i class="fa fa-pencil"></i> <em>{{field | capitalizeFirstLetter}}</em>',
            '</div>',
            '<div class="border-two">',
              '<div class="body">',
                '<form name="form">',
                  '<textarea name="field" class="input-field" data-ng-model="value" data-ng-style="{height: height+\'px\'}" data-ng-keydown="keyStroke($event, value)"></textarea>',
                '</form>',
              '</div>',
              '<div class="footer" data-ng-hide="!form.field.$dirty">',
                '<i class="fa fa-times stop" data-ng-click="reset()"></i>',
                '<button class="go fa fa-check-square-o" data-ng-click="assign(value)"></button>',
              '</div>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="edit-wrapper" data-ng-click="select($event)" data-ng-dblclick="select($event, true)">',
          '<span data-ng-transclude></span>',
          '<i class="fa fa-pencil" data-ng-if="hover"></i>',
        '</div>'
      ].join(''),
      scope: true,
      link: function(scope, element, attrs) {
        var property, originalValue;

        function parseValue(value, type) {
          if (type === 'number') {
            return parseFloat(value);
          }
          return value;
        };

        scope.promise = null;
        scope.$watch('editing', function(state) {
          if (state) {
            $timeout(function() {
              element.find('textarea').focus();
            });
          }
        });
        scope.$watch('editing', function() {
          scope.field = attrs.edit.split('.').pop();
          property = $parse(attrs.edit);
          scope.value = originalValue = property(scope);
          scope.height = Math.min(Math.floor((scope.value || '').length / 30) * 22 + 30, 400);
        }, true);

        scope.stop = function(evt) {
          evt.stopPropagation();
        };
        scope.reset = function() {
          property.assign(scope, originalValue);
          scope.editing = false;
        };
        scope.assign = function(value) {
          scope.editing = false;
          $rootScope.saving = true;
          property.assign(scope, parseValue(value, attrs.type));
          scope.data.model.$update().then(function() {
            $rootScope.saving = false;
          });
        };
        scope.select = function(evt, dblclick) {
          if (!$rootScope.user)
            return false;
          if (evt.shiftKey || dblclick) {
            scope.editing = true;
          }
        };
        scope.keyStroke = function(evt, value) {
          if (evt.keyCode === 83 && (evt.ctrlKey || evt.metaKey)) {
            evt.preventDefault();
            scope.assign(value);
          }
        };

        element.on('mouseenter mousemove', function(evt) {
          scope.$apply(function() {
            if (!$rootScope.user)
              return false;
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
      }
    };
  }])
  .directive('focus', ['$timeout', function($timeout) {
    return {
      scope: {
        focus: '='
      },
      link: function(scope, element) {
        scope.$watch('focus', function(state) {
          if (state) {
            $timeout(function() {
              element.focus();
            });
          }
        });
      }
    }
  }]);