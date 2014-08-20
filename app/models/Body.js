var mongoose = require('mongoose');

// model schema
var schema = mongoose.Schema({
  name: String,
  position: [Number],
  radius: Number,
  config: {},
  copy: {
    // description, culture, military
  }
}, {
  collection: 'Body'
});

var Body = module.exports = mongoose.model('Body', schema);