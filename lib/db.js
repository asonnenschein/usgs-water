var nano = require('nano');

module.exports = {
  configureDatabase: function (connect, dbName) {
    var dbUrl = connect || 'http://localhost:5984/',
        db = dbName || 'usgsWater',
        dbUrlConnect = nano(dbUrl);

    dbUrlConnect.get(db, function (err) {
      if (err) {
      	dbUrlConnect.create(db);
      }
    });
    var dbConnect = dbUrlConnect.use(db);
  }
};