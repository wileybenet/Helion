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
    User.findWhere({username: req.body.username})
      .then(function(user) {
        if (user && user.validPassword(req.body.password)) {
          req.user = user;
        } else {
          res.send({ error: 'incorrect username or password' });
          res.end()
        }
        next();
      }, function(err) {
        res.send({ error: 'incorrect username or password' });
        res.end();
        return next();
      });
  },
  authorize: function(level) {
    return function(req, res, next) {
      if (req.user && _.contains([].concat(level), req.user.authorization)) {
        next();
      } else {
        res.send(401, 'unauthorized');
        res.end();
      }
    };
  },
  start: function(req, res) {
    if (req.user && req.user._id) {
      res.cookie('_helion', serialize(req.user), {httpOnly: true});
      res.send(req.user);
      res.end();
    }
  },
  end: function(req, res) {
    res.clearCookie('_helion');
    res.send({success: true});
    res.end();
  },
  current: function(req, res) {
    if (req.user && req.user._id) {
      User.find(req.user._id).then(function(user) {
        res.send(user);
        res.end();
      }, function(err) {
        res.end(err);
      });
    } else {
      res.send({error: 'no session'});
      res.end();
    }
  },
  deserialize: function(req, res, next) {
    var parts = (req.cookies[sessionId] || '').split(/-(.+)?/);
    req.user = {
      _id: parts[1],
      authorization: +parts[0]
    };
    next();
  }
};