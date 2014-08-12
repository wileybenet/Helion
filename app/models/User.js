// libraries
var _ = require('lodash-node'),
  bcrypt = require('bcrypt');

// helper
function hash(password) {
  return bcrypt.hashSync(password, 8);
}

// module constructor
function User(data) {
  _.extend(this, data);
  this.password = hash(this.password);
  return this;
}
User.prototype.validPassword = function validPassword(password) {
  return bcrypt.compareSync(password, this.password);
};
User.prototype.changePassword = function changePassword(password) {
  this.password = hash(this.password);
  this.save();
};
User.prototype.resetPassword = function resetPassword() {
  //
};

module.exports = User;