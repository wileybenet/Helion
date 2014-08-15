angular.module('core', [])
  .controller('AppCtrl', ['$rootScope', '$http', 'User', function($rootScope, $http, User) {
    $http.get('/session').success(function(data) {
      if (data._id)
        $rootScope.user = new User(data);
    });
  }])
  .service('User', ['$rootScope', '$http', 'Base', function($rootScope, $http, Base) {
    return Base.extend({
      initialize: function User(data) {
        _.extend(this, data);
      },
      '$logout': function $logout() {
        $http.delete('/session').success(function() {
          delete $rootScope.user;
        });
      }
    });
  }])
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', 'User',
  function($scope, $rootScope, $http, User) {
    $scope.login = function(user) {
      $scope.error = null;
      $scope.authenticating = true;
      $http.post('/session', user).success(function(data) {
        if (data._id) {
          $scope.authenticating = false;
          $rootScope.loginPrompt = false;
          $rootScope.user = new User(data);
        } else {
          $scope.error = data.error;
        }
      });
    };
  }]);