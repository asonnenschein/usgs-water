var nano = require('nano'),
    _ = require('underscore');

module.exports = {
  configureDatabase: function (config) {
    var url = config.dbUrl || 'http://localhost:5984/',
        name = config.dbName || 'usgs-water',
        connection = nano(url);

    connection.db.list(function (err, names) {
      if (!_.contains(names, name)) {
        connection.db.create(name);
      }
    })
  }
};