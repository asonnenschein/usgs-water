var request = require('request'),
    JSONStream = require('JSONStream'),
    stream = require('event-stream'),
    process = require('./process'),
    _ = require('underscore');

module.exports = {
  // Abstract call to return entire body of USGS RESTful service
  usgsRequest: function (url, callback) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      	callback(body);
      }
    })
  },
  // Synchronous JSON stream, should make this asynchronous
  pipeUsgsRequest: function (url, callback) {
    request({url: url})
      .pipe(JSONStream.parse('*.timeSeries.*'))
      .pipe(stream.map(function (data) {
        var geo = process.streamGeoJSON(data);
        callback(geo);
      }))
  }
};