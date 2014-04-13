#!/usr/bin/env node
var async = require('async'),
  _ = require('underscore');

// Command line parameters
var argv = require('yargs')
  .usage('Command line tool for interfacing with USGS water service data')
  .alias('f', 'format')
  .describe('f', 'Data service format')

  .demand('s')
  .alias('s', 'state')
  .describe('s', 'U.S. two letter state abbreviation')

  .alias('g', 'gageheight')
  .describe('g', 'Return gage height data attribute')

  .alias('t', 'streamflow')
  .describe('t', 'Return streamflow data attribute')
  .default({f: 'json', g: true, t: true})
  .boolean(['g', 't'])
  .argv;

// Set parameter codes based on booleans from cli
var queries = [];
if (argv.gageheight) queries.push('0065');
if (argv.streamflow) queries.push('0060');

// Join parameters into one comma-delimited string
var query = _.map(queries, function(parameter) {
  return parameter;
}).join(',');

// Config object for constructing URL
var config = {
  baseUrl: 'http://waterservices.usgs.gov/nwis/iv/?',
  format: 'format=' + argv.format,
  state: '&stateCd=' + argv.state,
  parameters: '&parameterCd=' + query
};

// Make and execute a queue of tasks based on cli
var queue = [];
if (argv.state) queue.push(returnUrl);
async.series(queue);

// Return a URL for the USGS water services REST API
function returnUrl() {
  var url = config['baseUrl'] + 
            config['format'] + 
            config['state'] + 
            config['parameters'];
  console.log(url);
}