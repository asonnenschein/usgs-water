var mongoose = require('mongoose')
  , _ = require('underscore')
  , domain = require('domain');

var config = {dbHost: 'localhost', dbPort: '27071', dbName: 'usgswater'}
  , mongoUrl = ['mongodb:/', config.dbHost, config.dbName].join('/')

// *****************************
// * Records collection schema *
// *****************************
var recordsSchema = new mongoose.Schema({});

// ******************************
// * Harvests collection schema *
// ******************************
var harvestsSchema = new mongoose.Schema({});

// ******************************
// * Duplicates collection schema *
// ******************************
var geoJsonSchema = new mongoose.Schema({});

// ******************************
// * Duplicates collection schema *
// ******************************
var streamFlowSchema = new mongoose.Schema({});

// ******************************
// * Duplicates collection schema *
// ******************************
var gageHeightSchema = new mongoose.Schema({});

var mongoDb = mongoose.connect(mongoUrl);
mongoDb.connection.on('error', function (err) {
  console.log('Error connecting to MongoDB', err);
});

mongoDb.connection.on('open', function () {
  console.log('Connected to MongoDB');
});

function connectMongoCollection (mongoDb, collection, schema) {
  return mongoDb.model(collection, schema);
}

function getCollection (collection) {
  switch (collection) {
    case 'record':
      return connectMongoCollection(mongoDb, 'Records', recordsSchema);
      break;
    case 'harvest':
      return connectMongoCollection(mongoDb, 'Harvests', harvestsSchema);
      break;
    case 'geojson':
      return connectMongoCollection(mongoDb, 'GeoJSON', geoJsonSchema);
      break;
    case 'streamflow':
      return connectMongoCollection(mongoDb, 'StreamFlow', streamFlowSchema);
      break;
    case 'gageheight':
      return connectMongoCollection(mongoDb, 'GageHeight', gageHeightSchema);
      break;
  }
}

exports.getCollection = getCollection;