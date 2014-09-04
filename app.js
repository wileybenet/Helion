// dependencies
var processInfo = require('./app/process.info'),
  log = require('./app/logger').init({
    name: 'helion'
  }, processInfo),
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
    log.fatal('mongodb connection failed');
    process.exit(1);
  });

process.on('uncaughtException', function(err) {
  log.fatal('uncaught', err, err.stack);
});