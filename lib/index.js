var request = require('request'),
    JSONStream = require('JSONStream'),
    stream = require('event-stream'),
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
  pipeUsgsRequest: function (url) {
    request({url: url})
      .pipe(JSONStream.parse('*..sourceInfo'))
      .pipe(stream.mapSync(function (data) {
        console.log(data)
      }))
  },
  // Take USGS water data and return a GeoJSON feature
  toGeoJSON: function (data) {
    var makeGeo = function (data) {
      var id = data.name,
          site = data.siteName,
          lat = data.geoLocation.geogLocation.latitude,
          lng = data.geoLocation.geogLocation.longitude,
          srs = data.geoLocation.geogLocation.srs;

      return JSON.stringify({ 'type':'Feature',
                              'geometry':{'type':'Point',
                                          'coordinates':[lat,lng]},
                              'properties':{
                              'id': id,
           	                  'site': site
           	                   }
                            });
    },
  	    features = [],
        blob = JSON.parse(data),
        series = blob.value.timeSeries;

    _.map(series, function(feature) { 
      var almostGeo = makeGeo(feature.sourceInfo),
          doneGeo = JSON.parse(almostGeo);
      features.push(doneGeo);
    });
    return {'type':'FeatureCollection','features':features};
  }
};