
// helper
function errFn(res) {
  return function(err) {
    console.log(err);
    res.end(err);
  };
}

// module constructor
function Api(config) {
  this.store = config.store;
};

// public
Api.prototype.readAll = function readAll(request, response) {
  this.store.all(request.params.type)
    .then(function(objs) {
      response.end(objs.stringify());
    }, errFn(response));
};
Api.prototype.readOne = function readOne(request, response) {
  this.store.find(request.params.type, request.params.id)
    .then(function(obj) {
      response.end(obj.stringify());
    }, errFn(response));
};
Api.prototype.create = function create(request, response) {
  this.store.create(request.params.type, request.body)
    .then(function(obj) {
      response.end(obj.stringify());
    }, errFn(response));
};
Api.prototype.update = function update(request, response) {
  this.store.update(request.params.type, request.params.id, request.body)
    .then(function(obj) {
      response.end(obj.stringify());
    }, errFn(response));
};
Api.prototype.destroy = function destroy(request, response) {
  this.store.destroy(request.params.type, request.params.id)
    .then(function(obj) {
      log.api('Destroyed "'+obj.name+'"', 0);
      response.end(obj.stringify());
    }, errFn(response));
};

module.exports = Api;