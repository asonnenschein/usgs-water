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
          var geo = process.streamGeoJSON(data);
          callback(geo);
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

module.exports.pipeUsgsRequest = pipeUsgsRequest;

/*
  // Find duplicates in a DB in CouchDB
  findDuplicatesDB : function (array, callback) {
    var duplicates = process.findDuplicates(array),
        output = {};
    _.each(duplicates, function (item) {
      var streamFlow = item + ':00060',
          gageHeight = item + ':00065';
      output[item] = [streamFlow, gageHeight];
    });
    callback(output);
  },
  // Make new ids for records in a DB in CouchDB
  makeNewIdsDB: function (config, callback) {
    db.makeNewIds(config, function (ids) {
      callback(ids);
    });
  },
  // Query for which ids to remove in CouchDB
  removeByIdsDB: function (config, callback) {
    db.removeByIds(config, function (ids) {
      callback(ids);
    });
  },
  // Consolidate multiple variables for a single site
  consolidateAttrsDB: function (config, array, callback) {
    db.consolidateAttributes(config, array, function (data) {
      callback(data);
    });
  }
};
*/