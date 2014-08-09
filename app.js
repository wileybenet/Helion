var processInfo = require('./node_services/process.info'),
  Store = require('./node_services/S3.store'),
  Api = require('./node_services/api'),
  Server = require('./node_services/Server'),
  store, api, server;

store = new Store({
  path: './config.json'
});
api = new Api({
  store: store
});
server = new Server({
  api: api,
  ip: null,
  port: 8000,
  routes: {
    'get/:type': 'readAll',
    'get/:type/:id': 'readOne',
    'post/:type': 'create',
    'put/:type/:id': 'update',
    'delete/:type/:id': 'destroy'
  }
});

server.onNotification(function(data) {
  console.log(' Server %s', data);
});

store.onNotification(function(data) {
  console.log(' Store %s', data);
});

process.on('uncaughtException', function(err) {
  console.log('uncaught', err, err.stack);
});