var mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

// model schema
var schema = mongoose.Schema({
  username: String,
  password: {
    type: String,
    set: function set(password) {
      return bcrypt.hashSync(password, 8);
    }
  },
  authorization: {
    type: String,
    default: 'basic'
  }
}, {
  collection: 'User'
});
schema.methods.validPassword = function validPassword(password) {
  return bcrypt.compareSync(password, this.password);
};
schema.methods.changePassword = function changePassword(password) {
  this.password = bcrypt.hashSync(this.password, 8);
  this.save();
};
schema.methods.resetPassword = function resetPassword() {
  //
};

var User = module.exports = mongoose.model('User', schema);

