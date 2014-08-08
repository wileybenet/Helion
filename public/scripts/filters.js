angular.module('filters', [])
  .filter('capitalizeFirstLetter', [function() {
    return function(str) {
      return (str || '').substr(0,1).toUpperCase() + (str || '').slice(1);
    };
  }])
  .filter('htmlFormatted', ['$sce', function($sce) {
    return function(str) {
      str = (str || '').replace(/\n/g, '<br />');
      return $sce.trustAsHtml(str);
    };
  }]);