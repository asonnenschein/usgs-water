var _ = require('underscore');

// Turn USGS JSON into GeoJSON
var makeGeo = function (data) {
  var id = data.name,
      site = data.siteName,
      lat = data.geoLocation.geogLocation.latitude,
      lng = data.geoLocation.geogLocation.longitude,
      srs = data.geoLocation.geogLocation.srs;

  return JSON.stringify({'type':'Feature',
                         'geometry':{'type':'Point',
                                     'coordinates':[lat,lng]},
                         'properties':{'id': id,
                                       'site': site
                          }
                       })
};

module.exports = {
  // Take USGS water data and stream GeoJSON features
  streamGeoJSON: function (data) {
    return makeGeo(data);
  },
  // Tabke USGS water data and sync GeoJSON features
  syncGeoJSON: function (data) {
    var features = [],
        blob = JSON.parse(data),
        series = data.value.timeSeries;

    _.map(series, function(feature) { 
      var almostGeo = makeGeo(feature.sourceInfo),
          doneGeo = JSON.parse(almostGeo);
      features.push(doneGeo);
    });
    return {'type':'FeatureCollection','features':features};
  }
};