var mongo = require('./mongo-config')
  , usgsMapReduce = require('./map-reduce')
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

function reduceRecords (collection, callback) {
  var dbModel
    , o;
  dbModel = mongo.getCollection(collection);
  o = {};
  o.map = usgsMapReduce.map;
  o.reduce = usgsMapReduce.reduce;
  dbModel.mapReduce(o, function (err, res) {
    if (err) callback(err);
    else callback(res);
  })
}

exports.removeCollection = removeCollection;
exports.createRecords = createRecords;
exports.reduceRecords = reduceRecords;