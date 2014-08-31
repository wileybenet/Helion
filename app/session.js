// libraries
var _ = require('lodash-node');

// dependencies
var User = require('./models').User;

var sessionId;

// helper
function serialize(user) {
  return user.authorization+'-'+user._id;
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
            console.log(user);
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
  end: function(req, res) {
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
    var parts = (req.cookies[sessionId] || '').split(/-(.+)?/);
    req.user = {
      _id: parts[1],
      authorization: parts[0]
    };
    next();
  }
};