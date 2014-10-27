var express = require('express')
  , params = require('express-params')
  , path = require('path')
  , fs = require('fs')
  , cors = require('cors')
  , async = require('async')
  , routes = require('./routes')
  , db = require('./db')
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

var cache_data;

server.get('/usgs-water/data.json', function (req, res) {
  res.send(cache_data);
});

(function () {
  db.getAllDocs('record', function (err, res) {
  var minutes
    , interval
    ;

    if (err) console.log(err);

    cache_data = res;
    routes.subprocess();

    minutes = 15;
    interval = minutes * 60 * 1000;
    setInterval(function () {
      db.getAllDocs('record', function (err, res) {
        if (err) console.log(err);
        cache_data = res;
        routes.subprocess();
      })
    }, interval)
  })
})();

server.listen(3001);

module.exports = server;