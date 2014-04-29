#!/usr/bin/env node

var async = require('async'),
    _ = require('underscore'),
    lib = require('../lib'),
    fs = require('fs'),
    config = __dirname + '/../config.json';

// Command line parameters
var argv = require('yargs')
  .usage('Command line tool for interfacing with USGS water service data')
  
  .alias('u', 'url')
  .describe('u', 'Database URL')

  .alias('d', 'database')
  .describe('d', 'Connect to database')

  .alias('c', 'createDb')
  .describe('c', 'Create database')

  .alias('r', 'removeDb')
  .describe('r', 'Destroy database')

  .alias('s', 'state')
  .describe('s', 'U.S. two letter state abbreviation')

  .alias('a', 'allStates')
  .describe('a', 'Return data for all states in the U.S.')

  .alias('v', 'convertRecords')
  .describe('v', 'convert records in database to GeoJSON')

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
var configurate = function (url, db, callback) {
  if (url && db) {
    callback({'dbUrl': url, 'dbName': db});
  } else {
    fs.readFile(config, 'utf8', function (err, data) {
      if (err) callback(err);
      configData = JSON.parse(data);
      callback(configData);  
    })
  }
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
if (argv.url && argv.database && argv.createDb || argv.createDb) 
  queue.push(createDatabase);
if (argv.url && argv.database && argv.removeDb || argv.removeDb)
  queue.push(removeDatabase);
if (argv.url && argv.database && argv.allStates || argv.allStates)
  queue.push(insertAllRecords);
if (argv.url && argv.database && argv.state || argv.state)
  queue.push(insertStateRecords);
if (argv.url && argv.database && argv.convertRecords || argv.convertRecords)
  queue.push(convertAllRecords);
async.series(queue);

// Create a database in CouchDB
function createDatabase () {
  configurate(argv.url, argv.database, function (data) {
    lib.createCouchDB(data);
  })
};

// Remove a database in CouchDB
function removeDatabase () {
  configurate(argv.url, argv.database, function (data) {
    lib.killCouchDB(data);
  })
};

// Insert records for a single state into CouchDB
function insertStateRecords () {
  configurate(argv.url, argv.database, function (config) {
    var url = returnUrl(argv.state, query); 
    lib.pipeUsgsRequest(url, function (data) {
      lib.insertCouchDB(config, data);
    })
  })
};

// Insert records into CouchDB database
function insertAllRecords () {
  configurate(argv.url, argv.database, function (config) {
    var states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 
                  'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 
                  'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 
                  'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 
                  'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
    _.each(states, function (state) {
      var url = returnUrl(state, query)
      lib.pipeUsgsRequest(url, function (data) {
        lib.insertCouchDB(config, data);
      })
    })
  })
};

// Convert all records in DB to GeoJSON features
function convertAllRecords () {
  configurate(argv.url, argv.database, function (config) {
    lib.listRecordsDB(config, function (duplicates) {
      lib.findDuplicatesDB(duplicates, function (array) {
        lib.consolidateAttrsDB(config, array, function (data) {
          lib.insertCouchDB(config, data);
        });
      })
    })
  })
};