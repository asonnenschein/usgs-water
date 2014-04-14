var http = require('http'),
  _ = require('underscore');

var geo = function (data) {
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
  usgsRequest: function (url) {
    http.get(url, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        var blob = JSON.parse(data);
        console.log(blob);
      })
    })
  },
  toGeoJSON: function (data) {
    var blob = JSON.parse(data),
      series = blob.value.timeSeries;
      features = _.map(series, function(i) {
                   return geo(i.sourceInfo);
                 }).join(',')
      geoJson = {'type':'FeatureCollection',
                 'features':[features]
                };
    console.log(geoJson);
  }
};