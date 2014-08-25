angular.module('filters', [])
  .filter('capitalizeFirstLetter', [function() {
    return function(str) {
      return (str || '').substr(0,1).toUpperCase() + (str || '').slice(1);
    };
  }])
  .filter('htmlFormatted', ['$sce', function($sce) {
    return function(str) {
      str = (str || '').toString()
         // headers
        .replace(/# ([^\n]+)\n/g, function(s, m) { return '<div class="heading">' + m + '</div>' })
        // breaklines
        .replace(/\n/g, '<br />');
      return $sce.trustAsHtml(str);
    };
  }])
  .filter('int', [function() {
    return parseInt;
  }])
  .filter('math', [function() {
    return function(num, fn, option) {
      return Math[fn](num, option);
    };
  }])
  .filter('exp', ['$sce', function($sce) {
    return function(str, suffix) {
      return $sce.trustAsHtml((str || '').replace(/e(.+)/, function(fullStr, match) {
        return ' &times 10<sup>'+match+'</sup>';
      }) + suffix);
    };
  }]);