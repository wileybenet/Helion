var colors = require('colors'),
  log = require('./app/log'),
  express = require('express'),
  app = express(),
  server,
  bodyParser = require('body-parser'),
  store = require('./app/store'),
  errFn = function(res) {
    return function(err) {
      log.error(err);
      res.end(err);
    };
  };

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/v1/:type', function(req, res) {
  store.all(req.params.type)
    .then(function(obj) {
      log.api('Retreived "'+req.params.type+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.get('/api/v1/:type/:name', function(req, res) {
  store.findByName(req.params.type, req.params.name)
    .then(function(obj) {
      log.api('Found "'+req.params.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.put('/api/v1/:type/:name', function(req, res) {
  store.update(req.params.type, req.params.name, req.body)
    .then(function(obj) {
      log.api('Updated "'+req.params.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

server = app.listen(8000, function() {
  log.process('Express listening at 0.0.0.0:8000', 0);
});

process.on('uncaughtException', log.fatal);