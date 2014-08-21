// dependencies
var models = require('./models');

// helper
function cbFn(res) {
  return function(err, data) {
    if (err) {
      res.status(500).send(err).end();
    } else {
      res.send(data).end();
    }
  };
}

// module api
module.exports = function(app, session) {
  return function(endpoint) {
    return function(name) {
      var Model = models[name];
      app.get(endpoint + name, function(req, res) {
        Model.find({}).exec(cbFn(res));
      });
      app.get(endpoint + name + '/:id', session.authorize('admin'), function(req, res) {
        Model.findById(req.params.id).exec(cbFn(res));
      });
      app.post(endpoint + name, session.authorize('admin'), function(req, res) {
        var model = new Model(req.body)
        model.save(function(err) {
          cbFn(res)(err, model);
        });
      });
      app.put(endpoint + name + '/:id', session.authorize('admin'), function(req, res) {
        delete req.body._id;
        Model.findByIdAndUpdate(req.params.id, { $set: req.body }).exec(cbFn(res));
      });
      app.delete(endpoint + name + '/:id', session.authorize('admin'), function(req, res) {
        Model.findByIdAndRemove(req.params.id).exec(cbFn(res));
      });
    };
  };
};
