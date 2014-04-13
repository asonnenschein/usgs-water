#!/usr/bin/env node
var async = require('async'),
  _ = require('underscore');

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

var queries = [];
if (argv.gageheight) queries.push('0065');
if (argv.streamflow) queries.push('0060');

var query = _.map(queries, function(parameter) {
  return parameter;
}).join(',');

var config = {
  baseUrl: 'http://waterservices.usgs.gov/nwis/iv/?',
  format: 'format=' + argv.format,
  state: '&stateCd=' + argv.state,
  parameters: '&parameterCd=' + query
};

var toDo = [];
if (argv.state) toDo.push(returnUrl);
async.series(toDo);

function returnUrl() {
  var url = config['baseUrl'] + 
            config['format'] + 
            config['state'] + 
            config['parameters'];
  console.log(url);
}