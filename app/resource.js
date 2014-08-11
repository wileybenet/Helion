// dependencies
var models = require('./models');

// helper
function cbFn(res) {
  return function(data) {
    res.send(data);
    res.end();
  };
}

// module api
module.exports = function(app, session) {
  return function(endpoint) {
    return function(name) {
      var Model = models.get(name);
      app.get(endpoint + name, function(req, res) {
        Model.all().then(cbFn(res), cbFn(res));
      });
      app.get(endpoint + name + '/:id', session.authorize(0), function(req, res) {
        Model.find(req.params.id).then(cbFn(res), cbFn(res));
      });
      app.post(endpoint + name, session.authorize(0), function(req, res) {
        Model.create(req.body).then(cbFn(res), cbFn(res));
      });
      app.put(endpoint + name + '/:id', session.authorize(0), function(req, res) {
        Model.update(req.params.id, req.body).then(cbFn(res), cbFn(res));
      });
      app.delete(endpoint + name + '/:id', session.authorize(0), function(req, res) {
        Model.destroy(req.params.id).then(cbFn(res), cbFn(res));
      });
    };
  };
};
