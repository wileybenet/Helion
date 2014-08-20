var store = require('./app/store/mongo.store'),
  models = require('./app/models');

store.connect({
  path: 'config.json'
}).then(function() {
  for (var model in models) {
    global[model] = models[model];
  }
  console.log('models loaded');
});