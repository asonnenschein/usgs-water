var mongodb = require('mongodb');
var _ = require('underscore');
var domain = require('domain');

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

function connectDb (mongoUrl, callback) {
  mongodb.MongoClient.connect(mongoUrl, function (err, db) {
    if (err) callback(err);
    else callback(db);
  })
};

function dropDb (mongoUrl) {
  connectDb(mongoUrl, function (db) {
    if (db) console.log('Connected to databse:', db.databaseName);
    db.dropDatabase(function (err, res) {
      console.log('Database has been deleted');
      db.close();
    })
  })
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