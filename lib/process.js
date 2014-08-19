var db = require('./db')
  , pipes = require('./pipes')
  , domain = require('domain');

function harvest (url, callback) {
  var dataDomain;

  dataDomain = domain.create();
  dataDomain.on('error', function (err) {
    callback(err);
  });

  dataDomain.run(function () {
    pipes.pipeUsgsResponse(url, function (data) {
      db.createRecords('harvest', data, function (err, res) {
        if (err) callback(err);
        else callback (res);
      })
    })
  });
}

exports.harvest = harvest;