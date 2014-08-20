// libraries
var fs = require('fs');

fs.readdirSync(__dirname + '/models')
  .forEach(function(name) {
    var model = name.split('.')[0];
    exports[model] = require('./models/' + name);
  });