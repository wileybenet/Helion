var os = require('os'),
  _ = require('lodash-node');
  
module.exports = {
  ipAddress: _.chain(os.networkInterfaces())
    .values()
    .flatten()
    .find({family: 'IPv4', internal: false})
    .value()
    .address,
  port: process.argv[2] === '--production' ? 80 : 8000
};