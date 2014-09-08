angular.module('System', ['Body', 'Mover'])
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
      get: function get(_id) {
        var match = null;
        this.bodies.forEach(function(body) {
          if (body.model._id === _id) {
            match = body;
          }
        });
        return match;
      },
      randomBody: function randomBody() {
        return this.bodies[Math.floor(Math.random() * this.bodies.length)];
      }
    }
  }])
  .factory('Base', ['Emitter', function(Emitter) {
    function extend(prop1, prop2) {
      var property,
        parent = this,
        properties = prop1,
        classProperties = {},
        child;

      if (prop2) {
        properties = prop2;
        classProperties = prop1;
      }

      if (properties.hasOwnProperty('initialize')) {
        child = properties.initialize;
      } else {
        child = function() { return parent.apply(this, arguments); };
      }
      child.extend = extend.bind(child);

      child.prototype = Object.create(parent.prototype);
      child.prototype.constructor = child;

      child.prototype.$uper = parent.prototype;

      for (property in properties) {
        child.prototype[property] = properties[property];
      }

      for (property in classProperties) {
        child[property] = classProperties[property];
      }

      return child;
    }

    function Base() {
      return this.initialize.apply(this, arguments);
    }
    Base.prototype = Emitter;
    Base.prototype.constructor = Base;

    Base.extend = extend.bind(Base);

    return Base;
  }]);