var nano = require('nano'),
    _ = require('underscore');

var dbConfig = function (config) {
  var url = config.dbUrl || 'http://localhost:5984/',
      name = config.dbName || 'usgs-water';
  return {'url': url, 'name': name};
};

module.exports = {
  configureDatabase: function (config) {
    var dbc = dbConfig(config),
        connect = nano(dbc.url);

    connect.db.list(function (err, names) {
      if (!_.contains(names, dbc.name)) {
        connect.db.create(dbc.name);
      }
    })
  },
  killDatabase: function (config) {
    var dbc = dbConfig(config),
        connect = nano(dbc.url);

    connect.db.list(function (err, names) {
      if (_.contains(names, dbc.name)) {
        connect.db.destroy(dbc.name);
      }
    })
  },
  insertRecords: function (records) {
    var connect = nano('http://localhost:5984/'),
        db = connect.use('usgs-water');
        
    try {
      var data = JSON.parse(records);
      db.insert(data, data.properties.id, function (err, body) {
        if (!err) console.log(body);
      })
    }
    catch (err) {};
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
  }
};