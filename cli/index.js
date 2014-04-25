#!/usr/bin/env node

var async = require('async'),
    _ = require('underscore'),
    lib = require('../lib'),
    fs = require('fs'),
    config = __dirname + '/../config.json';

// Command line parameters
var argv = require('yargs')
  .usage('Command line tool for interfacing with USGS water service data')
  .alias('f', 'format')
  .describe('f', 'Data service format')

  .alias('s', 'state')
  .describe('s', 'U.S. two letter state abbreviation')

  .alias('a', 'allStates')
  .describe('a', 'Return data for all states in the U.S.')

  .alias('g', 'gageheight')
  .describe('g', 'Return gage height data attribute')

  .alias('t', 'streamflow')
  .describe('t', 'Return streamflow data attribute')

  .alias('d', 'database')
  .describe('d', 'Connect to database')

  .alias('c', 'create_db')
  .describe('c', 'Create database')

  .alias('r', 'remove_db')
  .describe('r', 'Destroy database')

  .default({f: 'json', g: true, t: true, a: false, d: false,
            c: false, r: false})
  .boolean(['g', 't', 'a', 'd', 'c', 'r'])
  .argv;

// Set parameter codes based on booleans from cli
var queries = [];
if (argv.gageheight) queries.push('00065');
if (argv.streamflow) queries.push('00060');

// Join parameters into one comma-delimited string
var query = _.map(queries, function(parameter) {
  return parameter;
}).join(',');

// Return a URL for the USGS water services REST API
var returnUrl = function (state, query) {
  var baseUrl = 'http://waterservices.usgs.gov/nwis/iv/?',
      format = 'format=json',
      state = '&stateCd=' + state,
      parameters = '&parameterCd=' + query;
  return baseUrl + format + state + parameters;
}

// Make and execute a queue of tasks based on cli
var queue = [];
if (argv.state) queue.push(returnState);
//if (argv.allStates) queue.push(returnAllStates);
if (argv.database && argv.create_db) queue.push(createDatabase);
if (argv.database && argv.remove_db) queue.push(removeDatabase);
if (argv.database && argv.allStates) queue.push(insertAllRecords);
async.series(queue);

// Return an individual state
function returnState () {
  var url = returnUrl(argv.state, query);
  lib.pipeUsgsRequest(url, function (data) {
    console.log(data);
  });
};

// Return every state
function returnAllStates () {
  var states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 
                'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 
                'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 
                'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 
                'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  _.each(states, function (state) {
    var url = returnUrl(state, query)
    lib.pipeUsgsRequest(url, function (data) {
      console.log(data)
    })
  })
};

// Create a database in CouchDB
function createDatabase () {
  fs.readFile(config, 'utf8', function (err, data) {
    if (err) return console.log('Error: ' + err);
    configData = JSON.parse(data);
    lib.createCouchDB(configData);
  })
};

// Remove a database in CouchDB
function removeDatabase () {
  fs.readFile(config, 'utf8', function (err, data) {
    if (err) return console.log('Error: ' + err);
    configData = JSON.parse(data);
    lib.killCouchDB(configData);
  })
};

// Insert records into CouchDB database
function insertAllRecords () {
  var states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 
                'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 
                'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 
                'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 
                'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  _.each(states, function (state) {
    var url = returnUrl(state, query)
    lib.pipeUsgsRequest(url, function (data) {
      lib.insertCouchDB(data);
    })
  })
};