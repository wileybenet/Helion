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
        res.end(err);
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
  end: function(req, res) {
    res.clearCookie('_helion');
    res.send({success: true});
    res.end();
  },
  start: function(req, res) {
    console.log('  session :'+req.user.username);
    res.cookie('_helion', serialize(req.user), {maxAge: 900000, httpOnly: true});
    res.send(req.user);
    res.end();
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