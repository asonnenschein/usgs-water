var mongo = require('./mongo-config')
  , geoJsonMapReduce = require('./map-reduce/geojson')
  , mergeMapReduce = require('./map-reduce/merge')
  , domain = require('domain')
  , _ = require('underscore');

function removeCollection (collection, callback) {
  var dbModel;
  dbModel = mongo.getCollection(collection);
  dbModel.remove({}, function (err) {
    if (err) callback(err);
    else callback('Removed collection:', collection);
  });
}

function createRecords (collection, data, callback) {
  var dbModel;

  dbModel = mongo.getCollection(collection);
  dbModel.collection.insert(data, function (err, res) {
    if (err) callback(err);
    else callback(res);
  });
}

function reduceRecords (collection, mapReduce, callback) {
  var dbModel
    , o
    , docIds
    , idQuery
    , thisMapReduce;

  dbModel = mongo.getCollection(collection);

  dbModel.find({}, function (err, res) {
    if (err) callback(err);
    docIds = [];
    _.each(res, function (doc) {
      docIds.push(doc._id);
    });
    idQuery = {_id: {$in: docIds}};
  });

  o = {};
  o.map = geoJsonMapReduce.map;
  o.reduce = geoJsonMapReduce.reduce;
  o.query = idQuery;

  dbModel.mapReduce(o, function (err, res) {
    if (err) callback(err);
    else callback(null, res);
  })
}

function reduceMerge (collection) {
  var dbModel
    , stream
    , gage
    , res
    , idQuery;

  dbModel = mongo.getCollection(collection);

  dbModel.find({}, function (err, res) {
    if (err) callback(err);
    docIds = [];
    _.each(res, function (doc) {
      docIds.push(doc._id);
    });
    idQuery = {_id: {$in: docIds}};
  });

  stream = {};
  stream.map = mergeMapReduce.streamFlowMap;
  stream.reduce = mergeMapReduce.reduce;
  stream.query = idQuery;
  stream.out = {reduce: 'merged'};

  gage = {};
  gage.map = mergeMapReduce.gageHeightMap;
  gage.reduce = mergeMapReduce.reduce;
  gage.query = idQuery;
  gage.out = {reduce: 'merged'};

  res = dbModel.mapReduce(stream);
  res = dbModel.mapReduce(gage);
}

exports.removeCollection = removeCollection;
exports.createRecords = createRecords;
exports.reduceRecords = reduceRecords;
exports.reduceMerge = reduceMerge;