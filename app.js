// dependencies
var processInfo = require('./app/process.info'),
  store = require('./app/s3.store'),
  Server = require('./app/Server'),
  models = require('./app/models'),
  api, server;

store.connect({
  path: './config.json',
  updateBackups: true
}).then(function(store) {
    models.bind(store);

    server = new Server({
      ip: null,
      port: 8000,
      sessionId: '_helion',
      resources: [
        'user',
        'body'
      ]
    });
  });

process.on('uncaughtException', function(err) {
  console.log('uncaught', err, err.stack);
});