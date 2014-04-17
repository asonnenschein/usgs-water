#!/usr/bin/env node
var async = require('async'),
    _ = require('underscore'),
    lib = require('../lib');

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
  .default({f: 'json', g: true, t: true, a: false})
  .boolean(['g', 't', 'a'])
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
if (argv.allStates) queue.push(returnAllStates);
async.series(queue);

// Return an individual state
function returnState() {
  var url = returnUrl(argv.state, query);
  lib.pipeUsgsRequest(url);
};

// Return every state
function returnAllStates() {
  var states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 
                'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 
                'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 
                'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 
                'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
  _.each(states, function (state) {
    var url = returnUrl(state, query)
    lib.pipeUsgsRequest(url);  
  })
}