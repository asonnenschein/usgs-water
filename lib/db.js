var mongodb = require('mongodb');
var _ = require('underscore');

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
}

function createDb (host, port, dbName) {
  var db = new mongodb.Db(dbName, new mongodb.Server(host, port), {w:1});
  db.open(function (err, db) {
    console.log('Database', dbName, 'created.');
    db.close();
  });
};

function dropDb (host, port, dbName) {
  connectDb(host, port, dbName, function (db) {
    db.dropDatabase(function (err, res) {
      console.log(res);
      db.close();
    })
  })
};

function connectDb (host, port, dbName, callback) {
  var dbUrl = 'mongodb://' + host + ':' + port + '/' + dbName;
  var db = mongodb.MongoClient.connect(dbUrl, function (err, db) {
    if (err) callback(err);
    console.log('Connected to database:', dbName);
    callback(db);
  })
};

function insertStates (host, port, dbName, callback) {
  connectDb(host, port, dbName, function (db) {
    collection = db.collection('haha');
    collection.insert({name:'duck', description:'huh'}, function (err, res) {
      db.close();
      if (err) callback(err);
      else callback('Entry saved');
    })
  });
};

module.exports.createDb = createDb;
module.exports.dropDb = dropDb;
module.exports.insertStates = insertStates;