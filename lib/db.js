var mongo = require('./mongo-config')
  , geoJsonMapReduce = require('./map-reduce/geojson')
  , mergeMapReduce = require('./map-reduce/merge')
  , domain = require('domain')
  , _ = require('underscore')
  ;

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

function reduceRecords (collection, callback) {
  var dbModel
    , o
    , docIds
    , idQuery
    ;

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

function reduceMerge (collection, callback) {
  var dbModel
    , stream
    , gage
    , res
    , idQuery
    ;

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
  stream.out = {reduce: 'joined'};

  gage = {};
  gage.map = mergeMapReduce.gageHeightMap;
  gage.reduce = mergeMapReduce.reduce;
  gage.query = idQuery;
  gage.out = {reduce: 'joined'};

//  res = dbModel.mapReduce(stream);
//  res = dbModel.mapReduce(gage);

  async.parallel({
    stream: function (callback) {
      dbModel.mapReduce(stream, function (err, res) {
        if (err) callback(null, new Error('failed'));
        else callback(null, 'passed');
      })
    },
    gage: function (callback) {
      dbModel.mapReduce(gage, function (err, res) {
        if (err) callback(null, new Error('failed'));
        else callback(null, 'passed');
      })
    }
  },
  function (err, res) {
    if (err) throw err;
    else callback(res);
  })
}

exports.removeCollection = removeCollection;
exports.createRecords = createRecords;
exports.reduceRecords = reduceRecords;
exports.reduceMerge = reduceMerge;