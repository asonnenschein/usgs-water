var request = require('request'),
    JSONStream = require('JSONStream'),
    stream = require('event-stream'),
    process = require('./process'),
    db = require('./db'),
    _ = require('underscore');

module.exports = {
  // Abstract call to return entire body of USGS RESTful service
  usgsRequest: function (url, callback) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      	callback(body);
      }
    })
  },
  // Aynchronous JSON stream
  pipeUsgsRequest: function (url, callback) {
    request({url: url})
      .pipe(JSONStream.parse('*.timeSeries.*'))
      .pipe(stream.map(function (data) {
        var geo = process.streamGeoJSON(data);
        callback(geo);
      }))
  },
  // Create DB in CouchDB
  createCouchDB: function (config) {
    db.configureDatabase(config);
  },
  // Destroy DB in CouchDB
  killCouchDB: function (config) {
    db.killDatabase(config);
  },
  // Insert records into CouchDB
  insertCouchDB: function (config, records) {
    db.insertRecords(config, records);
  },
  removeRecordsCouchDB: function (config, records) {
    db.removeRecords(config, records);
  },
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