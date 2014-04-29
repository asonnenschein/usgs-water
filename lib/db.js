var nano = require('nano'),
    _ = require('underscore');

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

module.exports = {
  configureDatabase: function (config) {
    var connect = nano(config.dbUrl);

    connect.db.list(function (err, names) {
      if (!_.contains(names, config.dbName)) {
        connect.db.create(config.dbName);
      }
    })
  },
  killDatabase: function (config) {
    var connect = nano(config.dbUrl);

    connect.db.list(function (err, names) {
      if (_.contains(names, config.dbName)) {
        connect.db.destroy(config.dbName);
      }
    })
  },
  insertRecords: function (config, records) {
    var connect = nano(config.dbUrl),
        db = connect.use(config.dbName);
        
    try {
      var data = records.constructor === Object ? records : JSON.parse(records);
      console.log(data);
      var idSplit = data.properties.id.split(':'),
          newId = function () {
            if (idSplit.length === 4) {
              return idSplit[0] + ':' + idSplit[1] + ':' + idSplit[2];
            } else {
              return idSplit[0] + ':' + idSplit[1];
            }
          };

      db.insert(data, newId(), function (err, body) {
        if (!err) console.log(body);
      })
    }
    catch (err) {};
  },
  removeRecords: function (config, records) {
    var connect = nano(config.dbUrl),
        db = connect.use(config.dbName);

    db.destroy(record, function (err, body) {
      if (!err) console.log(body);
    })
  },
  listRecords: function (config, callback) {
    var connect = nano(config.dbUrl),
        db = connect.use(config.dbName),
        ids = [];

    db.list(function (err, body) {
      var ids = [];
      if (!err) {
        body.rows.forEach(function (doc) {
          var idSplit = doc.id.split(':'),
              newId = idSplit[0] + ':' + idSplit[1];
          ids.push(newId);
        })
      }
      callback(ids);
    })
  },
  consolidateAttributes: function (config, array, callback) {
    var connect = nano(config.dbUrl),
        db = connect.use(config.dbName);

    _.each(array, function (record) {
      db.fetch({'keys':record}, function (err, body) {
        if (!err) 
          callback(consolidateGeoJSON(body));
      })
    })
  }
};