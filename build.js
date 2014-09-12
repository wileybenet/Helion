// libraries
var fs = require('fs');

// dependencies
var compiler = require('./app/compiler'),
  requiredFileTypes = ['js', 'css'];

// helpers
function writeFile(name, type) {
  fs.writeFile(__dirname + '/public/assets/' + name, compiler[type](), function(err) {
    console.log(' created ' + name);
  });
}

if (!fs.existsSync(__dirname + '/public/assets/')) {
  fs.mkdirSync(__dirname + '/public/assets');
}

fs.readdirSync(__dirname + '/public/assets/').forEach(function(currentName) {
  var type = currentName.split('.').pop();
    expectedFileName = compiler.getHashName(type);
  if (currentName !== expectedFileName) {
    fs.unlinkSync(__dirname + '/public/assets/' + currentName);
    writeFile(expectedFileName, type);
  } else {
    console.log(' no ' + type + ' changes detected');
  }
  requiredFileTypes.splice(requiredFileTypes.indexOf(type), 1);
});

requiredFileTypes.forEach(function(type) {
  writeFile(compiler.getHashName(type), type);
});