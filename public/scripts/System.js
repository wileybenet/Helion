angular.module('System', ['Collection'])
  .factory('System', ['Body', function(Body) {
    return {
      create: function(bodies) {
        var this_ = this;
        bodies.forEach(function(body) {
          this_[body.name] = body;
          this_.bodies.push(body);
        });
      },
      bodies: [],
      randomBody: function() {
        return this.bodies[Math.floor(Math.random() * this.bodies.length)];
      }
    }
  }])