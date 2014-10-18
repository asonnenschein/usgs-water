var JsonStream = require('JSONStream')
  , stream = require('event-stream')
  , http = require('http')
  , domain = require('domain')
  , db = require('./db')
  ;

function pipeUsgsResponse (url, callback) {
  var serverDomain = domain.create();
  serverDomain.on('error', function (err) {
    callback(err);
  });

  serverDomain.run(function () {
    var server;

    server = http.get(url, function (res) {

      res.pipe(JsonStream.parse('*.timeSeries.*'))
         .pipe(stream.map(function (data) {
            db.createRecords('harvest', data, function (err) {
              if (err) callback(err);
            })
         }));

      res.on('error', function (err) {
        callback(err);
      });

      res.on('end', function () {
        callback(null);
      });

    });

    server.shouldKeepAlive = false;

  });
}

exports.pipeUsgsResponse = pipeUsgsResponse;
