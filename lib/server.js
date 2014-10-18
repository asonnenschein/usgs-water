var express = require('express')
  , params = require('express-params')
  , routes = require('./routes')
  ;

var server = express();
params.extend(server);

server.post('/usgs-water/harvest', function (req, res, next) {
  return next();
}, routes.harvest);

server.listen(3000);

module.exports = server;