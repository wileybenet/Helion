angular.module('Base', [])
  .service('Base', [function() {
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
        child = function(){ return parent.apply(this, arguments); };
      }
      child.extend = extend.bind(child);

      child.prototype = parent.prototype;
      child.prototype.constructor = child;

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
    Base.extend = extend.bind(Base);

    return Base;
  }]);