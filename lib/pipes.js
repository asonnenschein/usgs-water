var JsonStream = require('JSONStream')
  , stream = require('event-stream')
  ,  _ = require('underscore')
  , http = require('http')
  , domain = require('domain');

function pipeUsgsResponse (url, callback) {
  var serverDomain;
  serverDomain = domain.create();
  serverDomain.on('error', function (err) {
    callback(err);
  });

  serverDomain.run(function () {
    var server;
    server = http.get(url, function (res) {
      res.pipe(JsonStream.parse('*.timeSeries.*'))
         .pipe(stream.map(function (data) {
            callback(data);
         }));

      res.on('error', function (err) {
        callback(err);
      });

      res.on('end', function () {
        callback(url);
      });
    });
    server.shouldKeepAlive = false;
  });
}

exports.pipeUsgsResponse = pipeUsgsResponse;
