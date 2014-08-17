var os = require('os'),
  _ = require('lodash-node');

function args(match) {
  var matchedArg;
  process.argv.forEach(function(arg) {
    if (arg.replace('--', '') === match.replace('--', '')) {
      matchedArg = arg
    }
  });
  return matchedArg;
}
  
module.exports = {
  ipAddress: _.chain(os.networkInterfaces())
    .values()
    .flatten()
    .find({family: 'IPv4', internal: false})
    .value()
    .address,
  port: args('production') ? 80 : 8000
};