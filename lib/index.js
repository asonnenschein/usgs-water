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
  function getExisting (array, id) {
    _.each(array, function (d) {
      if (d['var_id'] === id) {
        console.log(d);
      }
    })
  };

  var ids = [];
  var out = [];
  _.each(array, function (a) {
    var idSplit = a['var_id'].split(':');
    var id = idSplit[0] + ':' + idSplit[1];
    var code = idSplit[2];
    if (code === '00060' && ids.indexOf(a['site_id']) < 0) {
      ids.push(a['site_id']);
      out.push(a);
    } else if (code === '00060' && ids.indexOf(a['site_id']) > 0) {
      var record = getExisting(out, id + ':00065');
      console.log(record);
    } else if (code === '00065' && ids.indexOf(a['site_id']) < 0) {
      ids.push(a['site_id']);
      out.push(a);
    }
  });

  callback(out.length);
};

module.exports.pipeUsgsRequest = pipeUsgsRequest;
module.exports.findDuplicatesDb = findDuplicatesDb;