var _ = require('underscore');
var domain = require('domain');

function makeGeoJson (data, callback) {
  var jsonDomain = domain.create();

  jsonDomain.on('error', function (err) {
    callback(err);
  });

  jsonDomain.run(function () {
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

    var attributeData = [{
      'variableCode': variableCode,
      'variableUnit': variableUnit,
      'noDataValue': noDataValue,
      'value': value,
      'timeStamp': timeStamp
    }];

    var geoJson = {'type':'Feature',
                   'geometry':{'type':'Point', 'coordinates':[lat,lng]},
                   'properties':{'record': 'usgs-water', 'id': id,
                     'site': site,'srs': srs, 'siteCode': siteCode,
                     'variables': [attributeData]}};

    callback(JSON.stringify(geoJson));
  })
};


module.exports.makeGeoJson = makeGeoJson;