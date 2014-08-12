// libraries
var _ = require('lodash-node');

// module constructor
function Body(data) {
  _.extend(this, data);
  return this;
}

module.exports = Body;