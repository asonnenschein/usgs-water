#!/usr/bin/env node

var async = require('async')
  , _ = require('underscore')
  , process = require('../lib/process')
  , fs = require('fs');

// Command line parameters
var argv = require('yargs')
  .usage('Command line tool for interfacing with USGS water service data')

  .alias('h', 'harvest')
  .describe('h', 'Harvest water data from USGS')

  .alias('r', 'reduce')
  .describe('r', 'Reduce harvested records to GeoJSON')

  .argv;

var query = ['00065', '00060'].join(',');

// Return a URL for the USGS water services REST API
function returnUrl (state, query) {
  var baseUrl = 'http://waterservices.usgs.gov/nwis/iv/?'
    ,  format = 'format=json'
    ,  stateCd = '&stateCd=' + state
    ,  parameters = '&parameterCd=' + query;
  return baseUrl + format + stateCd + parameters;
}

// Make and execute a queue of tasks based on cli
var queue = [];
if (argv.harvest) queue.push(harvestRecords);
if (argv.reduce) queue.push(reduceRecords);
async.series(queue);

function harvestRecords () {
  var states
    , url;

  states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi',
            'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma',
            'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm',
            'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd',
            'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];

  _.each(states, function (state) {
    url = returnUrl(state, query);
    process.harvest(url, function (err, res) {
      if (err) console.log(err);
      else console.log(res);
    })
  });
}

function reduceRecords () {
  process.reduce(function (err, res) {
    if (err) console.log(err);
    else console.log(res);
  });
}