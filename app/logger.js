var bunyan = require('bunyan');

module.exports = {
  appLogger: null,
  init: function(config, settings) {
    this.appLogger = bunyan.createLogger({
      name: config.name,
      level: settings.logLevel
    });
    return this.appLogger;
  }
};