var path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser');

// module constructor
function Server(config) {
  this.app = express();

  this.api = config.api;

  this.app.use(express.static(path.resolve(__dirname, '..', 'public')));
  this.app.use(bodyParser.urlencoded({ extended: false }));
  this.app.use(bodyParser.json());

  for (var endpoint in config.routes) {
    var parts = endpoint.split(/^([^\/]*)/);
    this.app[parts[1]]('/api/v1'+parts[2], this.api[config.routes[endpoint]].bind(this.api));
  }

  this.internal = this.app.listen(config.port, config.ip, this.onStartup.bind(this));
}

// public
Server.prototype.onStartup = function onStartup() {
  this.notify('listening: ' + this.internal._connectionKey.substr(2));
};
Server.prototype.onNotification = function onNotification(cbFn) {
  this.listeners = this.listeners || [];
  this.listeners.push(cbFn);
};
Server.prototype.notify = function notify(data) {
  this.listeners.forEach(function(cbFn) {
    cbFn(data);
  });
};

module.exports = Server;