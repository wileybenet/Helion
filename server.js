var processInfo = require('./app/process.info'),
  colors = require('colors'),
  log = require('./app/log'),
  express = require('express'),
  app = express(),
  server,
  bodyParser = require('body-parser'),
  store = require('./app/s3.store'),
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
  log.api('get', 1);
  store.all(req.params.type)
    .then(function(obj) {
      log.api('Retreived "'+req.params.type+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.get('/api/v1/:type/:id', function(req, res) {
  log.api('get', 1);
  store.find(req.params.type, req.params.id)
    .then(function(obj) {
      log.api('Found "'+obj.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.put('/api/v1/:type/:id', function(req, res) {
  log.api('put', 1);
  store.update(req.params.type, req.params.id, req.body)
    .then(function(obj) {
      log.api('Updated "'+obj.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.post('/api/v1/:type', function(req, res) {
  log.api('post', 1);
  store.create(req.params.type, req.body)
    .then(function(obj) {
      log.api('Created "'+obj.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

app.delete('/api/v1/:type/:id', function(req, res) {
  log.api('delete', 1);
  store.destroy(req.params.type, req.params.id)
    .then(function(obj) {
      log.api('Destroyed "'+obj.name+'"', 0);
      res.end(obj.stringify());
    }, errFn(res));
});

server = app.listen(8000, /*processInfo.ipAddress,*/ function() {
  log.process('Express listening at 0.0.0.0:8000', 0);
});

process.on('uncaughtException', log.fatal);