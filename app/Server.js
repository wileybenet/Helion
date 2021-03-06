// libraries
var path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser');

// dependencies
var session = require('./session'),
  log = require('./logger').appLogger,
  templates = require('./templates'),
  resource = require('./resource'),
  models = require('./models'),
  User = models.User;

// module constructor
var Server = module.exports = function Server(config) {
  var this_ = this,
    resources = config.resources || [],
    app = express();

  var apiV1Resource = resource(app, session)('/api/v1/');

  session.config({
    id: config.sessionId
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(session.deserialize);

  app.get('/', templates.home);
  app.get('/index.html', templates.home)

  app.post('/session', session.authenticate, session.start);
  app.delete('/session', session.terminate);
  app.get('/session', session.current);

  resources.forEach(function(name) {
    apiV1Resource(name);
  });

  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  this.internal = app.listen(config.port, config.ip, function() {
    log.info('server listening %s', this_.internal._connectionKey.substr(2));
  });
};