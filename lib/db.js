var mongo = require('./mongo-config')
  , domain = require('domain')
  , _ = require('underscore');

function removeCollection (collection, callback) {
  var dbModel = mongo.getCollection(collection);
  dbModel.remove({}, function (err) {
    if (err) callback(err);
    else callback('Removed collection:', collection);
  });
}

function createRecords (collection, data, callback) {
  var dbModel = mongo.getCollection(collection);
  dbModel.collection.insert(data, function (err, res) {
    if (err) callback(err);
    else callback(res);
  });
}

exports.removeCollection = removeCollection;
exports.createRecords = createRecords;

/*
var consolidateGeoJSON = function (data) {
  var parent = data.rows[0].doc,
      child = data.rows[1].doc.properties.variables,
      splitId = parent.properties.id.split(':'),
      newId = splitId[0] + ':' + splitId[1];
  delete parent._id;
  delete parent._rev;
  parent.properties.id = newId;
  parent.properties.variables.push(child);
  
  return parent;
};


function findEverything (db, colName, callback) {
  var collection = db.collection(colName);
  collection.find().toArray(function (err, docs) {
    if (err) callback(err);
    else callback(docs);
  })
};

function insertData (db, colName, record, callback) {
  if (db) console.log('Connected to database:', db.databaseName);
  var collection = db.collection(colName);
  var dataDomain = domain.create();

  dataDomain.on('error', function (err) {
    callback(err);
  });

  dataDomain.run(function () {
    var data = record.constructor === Object ? record : JSON.parse(record);
    var idSplit = data.properties.id.split(':');

    function varId () {
      if (idSplit.length === 4) {
        return idSplit[0] + ':' + idSplit[1] + ':' + idSplit[2];
      } else {
        return idSplit[0] + ':' + idSplit[1];
      }
    };

    function siteId () {
      if (idSplit.length === 4) {
        return idSplit[0] + ':' + idSplit[1];
      } else {
        return idSplit[0] + ':' + idSplit[1];
      }
    };

    var insertData = {site_id: siteId(), var_id: varId(), data: data};
    collection.insert(insertData, function (err, res) {
      if (err) callback(err);
      else callback('Entry saved');
    })
  })
};

module.exports.connectDb = connectDb;
module.exports.dropDb = dropDb;
module.exports.insertData = insertData;
module.exports.findEverything = findEverything;
*/