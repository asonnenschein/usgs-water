var express = require('express')
  , params = require('express-params')
  , path = require('path')
  , fs = require('fs')
  , cors = require('cors')
  , routes = require('./routes')
  ;

var server = express();
params.extend(server);

var style = path.join(__dirname, './../public/style')
  , script = path.join(__dirname, './../public/script')
  , assets = path.join(__dirname, './../public/assets')
  , views = path.join(__dirname, './../public/views')
  ;

server.use(cors());

server.use('/style', express.static(style));
server.use('/script', express.static(script));
server.use('/assets', express.static(assets));
server.use('/', express.static(views));

server.post('/usgs-water/harvest', function (req, res, next) {
  return next();
}, routes.harvest);

server.get('/usgs-water/data.json', function (req, res, next) {
  return next();
}, routes.getDocument);

server.listen(3000);

module.exports = server;