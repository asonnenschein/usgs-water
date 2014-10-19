var mongo = require('./mongo-config')
  , geoJsonMapReduce = require('./map-reduce/geojson')
  , mergeMapReduce = require('./map-reduce/merge')
  , domain = require('domain')
  , _ = require('underscore')
  , async = require('async')
  ;

function removeCollection (collection, callback) {
  var dbModel;
  dbModel = mongo.getCollection(collection);
  dbModel.remove({}, function (err) {
    if (err) callback(err);
    else callback(null, 'Removed collection:', collection);
  });
}

function createRecords (collection, data, callback) {
  var dbModel;

  dbModel = mongo.getCollection(collection);
  dbModel.collection.insert(data, function (err, res) {
    if (err) callback(err);
    else callback(null, res);
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
    else callback(null, res);
  })
}

function singleGeoJsonDoc (collection, callback) {
  var dbModel
    , stream
    , geoJson
    ;

  dbModel = mongo.getCollection(collection);
  stream = dbModel.find().stream();
  geoJson = {"data": []};

  stream.on('data', function (data) {
    var geometry
      , properties
      , doc
      ;

    doc = data._doc;
    geometry = doc.value.geometry;
    properties = doc.value.properties;
    if (geometry && properties) {
      geoJson.data.push({
        "type": "Feature",
        "properties": properties,
        "geometry": geometry
      })
    }
  }).on('error', function (err) {
    callback(err);
  }).on('close', function () {
    callback(null, geoJson);
  })
}

function getAllDocs (collection, callback) {
  var dbModel;

  dbModel = mongo.getCollection(collection);
  dbModel.find().lean().exec(function (err, data) {
    if (err) callback(err);
    else callback(null, data[0].data);
  })
}

exports.removeCollection = removeCollection;
exports.createRecords = createRecords;
exports.reduceRecords = reduceRecords;
exports.reduceMerge = reduceMerge;
exports.singleGeoJsonDoc = singleGeoJsonDoc;
exports.getAllDocs = getAllDocs;