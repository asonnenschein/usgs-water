var request = require('request'),
    _ = require('underscore');

var makeGeo = function (data) {
  var id = data.name,
      site = data.siteName,
      lat = data.geoLocation.geogLocation.latitude,
      lng = data.geoLocation.geogLocation.longitude,
      srs = data.geoLocation.geogLocation.srs;

  return JSON.stringify({ 'type':'Feature',
           'geometry':{'type':'Point','coordinates':[lat,lng]},
           'properties':{
             'id': id,
           	 'site': site
           	}
          });
}

module.exports = {
  usgsRequest: function (url, callback) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      	callback(body);
      }
    })
  },
  toGeoJSON: function (data) {
  	var features = [],
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