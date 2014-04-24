var nano = require('nano'),
    _ = require('underscore');

module.exports = {
  configureDatabase: function (url, db) {
    var dbUrl = url || 'http://localhost:5984/',
        dbName = db || 'usgs-water';
    
    var connection = nano(dbUrl),
        dbConnect = connection.db.use(dbName);

    connection.db.list(function (err, names) {
      if (!_.contains(names, dbName)) {
        connection.db.create(dbName);
      }
    })
  }
};