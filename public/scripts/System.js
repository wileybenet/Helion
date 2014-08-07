angular.module('System', [])
  .factory('System', ['Body', function(Body) {
    return {
      create: function(bodies) {
        this._append(this, bodies);
      },
      bodies: [],
      randomBody: function() {
        return this.bodies[Math.floor(Math.random() * this.bodies.length)];
      },
      _append: function(anchor, bodies) {
        var this_ = this;
        bodies.forEach(function(body) {
          if (body instanceof Body)
            this_.bodies.push(body);
          anchor[body.name] = body;
          if (body.bodies) {
            this_._append(anchor[body.name], body.bodies);
          }
        });
      }
    }
  }])