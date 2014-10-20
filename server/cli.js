#!/usr/bin/env node

var program = require('commander')
  , async = require('async')
  , routes = require('./routes')
  ;

program
  .version('0.0.1')
  .option('-a, --all', 'Harvest all states JSON and reduce to GeoJSON')
  .option('-e, --empty', 'Empty all collections in the database')
  ;

program.on('--help', function () {
  console.log(' Examples:');
  console.log('');
  console.log('   Harvest every state and reduce to GeoJSON --');
  console.log('   $ usgs-water -a');
  console.log('');
  console.log('   Empty every collection in the database --');
  console.log('   $ usgs-water -e');
  console.log('');
});

program.parse(process.argv);

var queue = [];
if (program.all) queue.push(all);
if (program.empty) queue.push(remove);
async.series(queue);

function all () {
  routes.harvest(function (err) {
    if (err) throw err;
    else process.exit(0);
  })
}

function remove () {
  routes.empty(function (err) {
    if (err) throw err;
    else process.exit(0);
  })
}

exports.all = all;
exports.remove = remove;