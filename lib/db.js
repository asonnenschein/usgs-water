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
  }
};