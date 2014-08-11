var models = require('./models');


// helper
function errFn(res) {
  return function(err) {
    console.log(err);
    res.end(err);
  };
}

function send(response, obj) {
  response.end(JSON.stringify(obj));
}

// module constructor
module.exports = function Api() {
  
}


// public
Api.prototype.onNotification = function onNotification(cbFn) {
  this.listeners = this.listeners || [];
  this.listeners.push(cbFn);
};
Api.prototype.notify = function notify(data) {
  this.listeners.forEach(function(cbFn) {
    cbFn(data);
  });
};
Api.prototype.readAll = function readAll(request, response) {
  console.log(' API reading all :' + request.params.type);
  models.get(request.params.type).all()
    .then(function(objs) {
      console.log('  read all :' + request.params.type);
      send(response, objs);
    }, errFn(response));
};
Api.prototype.readOne = function readOne(request, response) {
  console.log(' API reading one :' + request.params.id);
  models.get(request.params.type).find(request.params.id)
    .then(function(obj) {
      console.log('  read one :' + request.params.id);
      send(response, obj);
    }, errFn(response));
};
Api.prototype.create = function create(request, response) {
  console.log(' API creating :' + request.params.type);
  models.get(request.params.type).create(request.body)
    .then(function(obj) {
      console.log('  created :' + request.params.type);
      send(response, obj);
    }, errFn(response));
};
Api.prototype.update = function update(request, response) {
  console.log(' API updating :' + request.params.type + ' ('+request.params.id+')');
  models.get(request.params.type).update(request.params.id, request.body)
    .then(function(obj) {
      console.log('  updated :' + request.params.type + ' ('+request.params.id+')');
      send(response, obj);
    }, errFn(response));
};
Api.prototype.destroy = function destroy(request, response) {
  console.log(' API destroying :' + request.params.type + ' ('+request.params.id+')');
  models.get(request.params.type).destroy(request.params.id)
    .then(function(obj) {
      console.log('  destroyed :' + request.params.type + ' ('+request.params.id+')');
      send(response, obj);
    }, errFn(response));
};