var JSONStream = require('JSONStream');
var stream = require('event-stream');
var process = require('./process');
var db = require('./db');
var  _ = require('underscore');
var http = require('http');
var domain = require('domain');

function pipeUsgsRequest (url, callback) {
  var serverDomain = domain.create();

  serverDomain.on('error', function (err) {
    callback(err);
  });

  serverDomain.run(function () {
    var server = http.get(url, function (res) {
      res.pipe(JSONStream.parse('*.timeSeries.*'))
         .pipe(stream.map(function (data) {
          process.makeGeoJson(data, function (geo) {
            callback(geo);
          });
        }));

      res.on('error', function (err) {
        callback(err);
      });

      res.on('end', function () {
        callback(url);
      });

    });

    server.shouldKeepAlive = false;
  });
};

function findDuplicatesDb (array, callback) {
  var ids = [];
  var out = {};
  _.each(array, function (a) {
    var siteId = a.site_id;
    if (ids.indexOf(siteId) < 0) {
      ids.push(siteId)
    }

  });
  callback(ids.length);
};

module.exports.pipeUsgsRequest = pipeUsgsRequest;
module.exports.findDuplicatesDb = findDuplicatesDb;