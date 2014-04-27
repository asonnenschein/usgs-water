var _ = require('underscore');

// Turn USGS JSON into GeoJSON
var makeGeo = function (data) {
  try {
    var id = data.name,
        site = data.sourceInfo.siteName,
        lat = data.sourceInfo.geoLocation.geogLocation.latitude,
        lng = data.sourceInfo.geoLocation.geogLocation.longitude,
        srs = data.sourceInfo.geoLocation.geogLocation.srs,
        siteCode = data.sourceInfo.siteCode[0].value,
        variableCode = data.variable.variableCode[0].value,
        variableUnit = data.variable.unit.unitAbbreviation,
        noDataValue = data.variable.noDataValue,
        value = data.values[0].value[0].value,
        timeStamp = data.values[0].value[0].dateTime;

    var attributeData = {
      'variableCode': variableCode,
      'variableUnit': variableUnit,
      'noDataValue': noDataValue,
      'value': value,
      'timeStamp': timeStamp,
    };

    return JSON.stringify({'type':'Feature',
                          'geometry':{'type':'Point',
                                      'coordinates':[lat,lng]},
                          'properties':{'record': 'usgs-water',
                                        'id': id,
                                        'site': site,
                                        'srs': srs,
                                        'siteCode': siteCode,
                                        'variables': attributeData,
                                       }
                          });
  }
  catch (err) {/* Who cares?  This is a hobby project. */};
};

module.exports = {
  // Take USGS water data and stream GeoJSON features
  streamGeoJSON: function (data) {
    return makeGeo(data);
  },
  // Take USGS water data and sync GeoJSON features
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