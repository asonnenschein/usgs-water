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

function findDuplicatesDb (array, callback) {
  function getExisting (array, id) {
    _.each(array, function (d) {
      if (d['var_id'] === id) {
        console.log(d);
      }
    })
  };

  var ids = [];
  var out = [];
  _.each(array, function (a) {
    var idSplit = a['var_id'].split(':');
    var id = idSplit[0] + ':' + idSplit[1];
    var code = idSplit[2];
    if (code === '00060' && ids.indexOf(a['site_id']) < 0) {
      ids.push(a['site_id']);
      out.push(a);
    } else if (code === '00060' && ids.indexOf(a['site_id']) > 0) {
      var record = getExisting(out, id + ':00065');
      console.log(record);
    } else if (code === '00065' && ids.indexOf(a['site_id']) < 0) {
      ids.push(a['site_id']);
      out.push(a);
    }
  });

  callback(out.length);
}

module.exports.makeGeoJson = makeGeoJson;