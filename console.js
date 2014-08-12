var store = require('./app/s3.store'),
  models = require('./app/models');

store.connect({path: './config.json'})
  .then(function(store) {
    models.bind(store);
  });

models.all().forEach(function(Model) {
  global[Model.name] = Model;
});