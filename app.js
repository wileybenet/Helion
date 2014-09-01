// dependencies
var processInfo = require('./app/process.info'),
  store = require('./app/store/mongo.store'),
  Server = require('./app/Server');

store.connect({
  path: 'config.json'
}).then(function() {
    var server = new Server({
      ip: null,
      port: processInfo.port,
      sessionId: '_helion',
      resources: [
        'User',
        'Body',
        'Mover'
      ]
    });
  }, function() {
    console.log('fatal error: mongodb connection failed');
    process.exit(1);
  });

process.on('uncaughtException', function(err) {
  console.log('uncaught', err, err.stack);
});