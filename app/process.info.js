var os = require('os'),
  _ = require('lodash-node');

function args(match) {
  var matchedArg;
  process.argv.forEach(function(arg) {
    if (arg.replace('--', '') === match.replace(/([A-Z])/g, function(m) { return '-' + m.toLowerCase(); }).replace('--', '')) {
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
  port: args('production') ? 80 : (args('dev') ? 8000 : 8000),
  logLevel: args('production') ? 'error' : (args('dev') ? 'info' : 'warn'),
};