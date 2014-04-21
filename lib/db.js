var nano = require('nano');

module.exports = {
  makeDatabase: function (connect, dbName) {
    var dbUrl = connect || 'http://localhost:5984/',
        db = dbName || 'usgsWater',
        dbUrlConnect = nano(dbUrl);

    if (!dbUrlConnect.use(db)) {dbUrlConnect.create('db')};
    var dbConnect = dbUrlConnect.use(db);
  }
};