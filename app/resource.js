// dependencies
var models = require('./models');

// helper
function cbFn(res) {
  return function(err, data) {
    res.send(data);
    res.end();
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
        new Model(req.body).save(cbFn(res));
      });
      app.put(endpoint + name + '/:id', session.authorize('admin'), function(req, res) {
        Model.update({ _id: req.params.id }, { $set: req.body }).exec(cbFn(res));
      });
      app.delete(endpoint + name + '/:id', session.authorize('admin'), function(req, res) {
        Model.findByIdAndRemove(req.params.id).exec(cbFn(res));
      });
    };
  };
};
