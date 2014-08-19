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
    });
  })
}

/*
// Make and execute a queue of tasks based on cli
var queue = [];
if (argv.harvest) queue.push(harvestRecords);
/*
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
}



function getAllDocuments () {
  var mongoUrl = configure(argv.host, argv.port, argv.database);
  mDb.connectDb(mongoUrl, function (db) {
    mDb.findEverything(db, 'allStates', function (res) {
      proc.findDuplicatesDb(res, function (d) {
        console.log(d);
        db.close();
      })
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
*/