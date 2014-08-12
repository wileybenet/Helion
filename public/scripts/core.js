angular.module('core', [])
  .controller('AppCtrl', ['$rootScope', '$http', 'User', function($rootScope, $http, User) {
    $http.get('/session').success(function(data) {
      if (data._id)
        $rootScope.user = new User(data);
    });
  }])
  .service('User', ['$rootScope', '$http', function($rootScope, $http) {
    function User(data) {
      _.extend(this, data);
    }
    User.prototype.$logout = function $logout() {
      $http.delete('/session').success(function() {
        delete $rootScope.user;
      });
    }
    return User;
  }])
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', 'User',
  function($scope, $rootScope, $http, User) {
    $scope.login = function(user) {
      $scope.error = null;
      $http.post('/session', user).success(function(data) {
        if (data._id) {
          $rootScope.loginPrompt = false;
          $rootScope.user = new User(data);
        } else {
          $scope.error = data.error;
        }
      });
    };
  }]);