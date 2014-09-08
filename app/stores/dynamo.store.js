var AWS = require('aws-sdk')
  Q = require('q');
  

module.exports = {
  connect: function connect() {
    var this_ = this,
      deferred = Q.defer(),
      dynamodb;
    if (config.path)
      AWS.config.loadFromPath(config.path);
    if (config.creds)
    dynamodb = new AWS.DynamoDB();
  }
};