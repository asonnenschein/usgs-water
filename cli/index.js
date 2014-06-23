#!/usr/bin/env node

var async = require('async');
var _ = require('underscore');
var mDb = require('../lib/db');
var proc = require('../lib');
var fs = require('fs');
var config = __dirname + '/../config.json';

// Command line parameters
var argv = require('yargs')
  .usage('Command line tool for interfacing with USGS water service data')
  
  .alias('u', 'url')
  .describe('u', 'Database URL')

  .alias('h', 'host')
  .describe('h', 'Host address to connect to')

  .alias('p', 'port')
  .describe('p', 'Host port to connect to')

  .alias('d', 'database')
  .describe('d', 'Connect to database')

  .alias('c', 'createDb')
  .describe('c', 'Create database')

  .alias('r', 'removeDb')
  .describe('r', 'Destroy database')

  .alias('f', 'find')
  .describe('f', 'Find all documents in collection')

  .alias('a', 'allStates')
  .describe('a', 'Return data for all states in the U.S.')

  .alias('v', 'convertRecords')
  .describe('v', 'convert records in database to GeoJSON')

  .alias('m', 'removeRecords')
  .describe('m', 'Remove specific records')

  .alias('e', 'everything')
  .describe('e', 'Do everything')

  .alias('g', 'gageheight')
  .describe('g', 'Return gage height data attribute')

  .alias('t', 'streamflow')
  .describe('t', 'Return streamflow data attribute')

  .default({f: 'json', g: true, t: true, a: false,
            c: false, r: false})
  .boolean(['g', 't', 'a', 'c', 'r'])
  .argv;

// Set parameter codes based on booleans from cli
var queries = [];
if (argv.gageheight) queries.push('00065');
if (argv.streamflow) queries.push('00060');

// Join parameters into one comma-delimited string
var query = _.map(queries, function(parameter) {
  return parameter;
}).join(',');

// Make a config object out of DB parameters
var configure = function (host, port, db) {
  if (host && port && db) return 'mongodb://' + host + ':' + port + '/' + db;
};

// Return a URL for the USGS water services REST API
var returnUrl = function (state, query) {
  var baseUrl = 'http://waterservices.usgs.gov/nwis/iv/?',
      format = 'format=json',
      state = '&stateCd=' + state,
      parameters = '&parameterCd=' + query;
  return baseUrl + format + state + parameters;
};

// Make and execute a queue of tasks based on cli
var queue = [];
if (argv.host && argv.port && argv.database && argv.removeDb || argv.removeDb)
  queue.push(removeDatabase);
if (argv.host && argv.port && argv.database && argv.allStates || argv.allStates)
  queue.push(insertAllRecords);
if (argv.host && argv.port && argv.database && argv.find)
  queue.push(getAllDocuments);
if (argv.url && argv.database && argv.convertRecords || argv.convertRecords)
  queue.push(convertAllRecords);
if (argv.url && argv.database && argv.removeRecords || argv.removeRecords)
  queue.push(removeTheseRecords);
if (argv.url && argv.database && argv.everything || argv.everything)
  queue.push(doEverything);
async.series(queue);

// Remove a database in CouchDB
function removeDatabase () {
  var mongoUrl = configure(argv.host, argv.port, argv.database);
  mDb.dropDb(mongoUrl);
};

// Insert records into CouchDB database
function insertAllRecords () {
  var mongoUrl = configure(argv.host, argv.port, argv.database);
  var states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi',
                'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma',
                'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm',
                'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd',
                'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  mDb.connectDb(mongoUrl, function (db) {
    _.each(states, function (state) {
      var url = returnUrl(state, query);
      proc.pipeUsgsRequest(url, function (data) {
        mDb.insertData(db, 'allStates', data, function (res) {
          console.log(res);
        })
      })
    })
  })
};

function getAllDocuments () {
  var mongoUrl = configure(argv.host, argv.port, argv.database);
  mDb.connectDb(mongoUrl, function (db) {
    mDb.findEverything(db, 'allStates', function (res) {
      console.log(res);
      db.close();
    })
  })
};

// Convert all records in DB to GeoJSON features
function convertAllRecords () {
  configurate(argv.url, argv.database, function (config) {
    lib.makeNewIdsDB(config, function (duplicates) {
      lib.findDuplicatesDB(duplicates, function (array) {
        lib.consolidateAttrsDB(config, array, function (data) {
          lib.insertCouchDB(config, data);
        });
      })
    })
  })
};

function removeTheseRecords () {
  configurate(argv.url, argv.database, function (config) {
    lib.removeByIdsDB(config, function (data) {
      _.each(data, function (record) {
        lib.removeRecordsCouchDB(config, record);
      })
    })
  })
};

function doEverything () {
  removeDatabase();
  createDatabase();
  insertAllRecords();
  convertAllRecords();
  removeTheseRecords();
}