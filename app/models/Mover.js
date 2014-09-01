var mongoose = require('mongoose');

// model schema
var schema = mongoose.Schema({
  home: String, 
  config: {
    // fixed, speed, finish
  },
  waypoints: Array
}, {
  collection: 'Mover'
});

var Mover = module.exports = mongoose.model('Mover', schema);