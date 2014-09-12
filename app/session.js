// libraries
var crypto = require('crypto'),
  _ = require('lodash-node');

// dependencies
var log = require('./logger').appLogger,
  User = require('./models').User;

var sessionId;

// helper
function encrypt(str, key) {
  var cipher = crypto.createCipher('aes192', key.toString().replace(/[^A-z]/g, '')),
    crypted = cipher.update(str, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
function decrypt(str, key) {
  var decipher = crypto.createDecipher('aes192', key.toString().replace(/[^A-z]/g, '')),
    dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
function serialize(user) {
  return encrypt(user.authorization, user._id)+'-'+user._id;
}
function deserialize(cookie) {
  if (!cookie)
    return null;
  var parts = cookie.split(/-(.+)?/);
  return {
    _id: parts[1],
    authorization: decrypt(parts[0], parts[1])
  };
}

// module api
var session = module.exports = {
  config: function(sessionConfig) {
    sessionId = sessionConfig.id;
  },
  authenticate: function(req, res, next) {
    if (req.user && req.user._id)
      return res.end('already authenticated');
    User.findOne({ username: req.body.username })
      .exec(function(err, user) {
        if (err) {
          res.send({ error: 'incorrect username or password' });
          res.end();
          return next();
        } else {
          if (user && user.validPassword(req.body.password)) {
            log.info(user);
            req.user = user;
          } else {
            res.send({ error: 'incorrect username or password' });
            res.end()
          }
          next();
        }
      });
  },
  authorize: function(level) {
    return function(req, res, next) {
      if (req.user && _.contains([].concat(level), req.user.authorization)) {
        next();
      } else {
        res.status(401).send('unauthorized');
        res.end();
      }
    };
  },
  start: function(req, res) {
    if (req.user && req.user._id) {
      res.cookie(sessionId, serialize(req.user), {httpOnly: true});
      res.send(req.user);
      res.end();
    }
  },
  terminate: function(req, res) {
    res.clearCookie(sessionId)
      .send({success: true})
      .end();
  },
  current: function(req, res) {
    if (req.user && req.user._id) {
      User.findById(req.user._id).exec(function(err, user) {
        if (err) {
          res.send(err).end();
        } else {
          res.send(user).end();
        }
      });
    } else {
      res.send({error: 'no session'}).end();
    }
  },
  deserialize: function(req, res, next) {
    req.user = deserialize(req.cookies[sessionId] || '');
    next();
  }
};