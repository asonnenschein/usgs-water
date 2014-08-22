var db = require('./db')
  , pipes = require('./pipes');

function harvest (url, callback) {
  pipes.pipeUsgsResponse(url, function (data) {
    if (data) {
      db.createRecords('harvest', data, function (err, res) {
        if (err) callback(err);
        else callback(res);
      })
    }
  });
}

function reduceToGeoJSON (callback) {
  db.reduceRecords('harvest', function (err, data) {
    if (err) callback(err);
    db.createRecords('geojson', data, function (err, res) {
      if (err) callback(err);
      else callback(res);
    })
  });
}

exports.harvest = harvest;
exports.reduceToGeoJSON = reduceToGeoJSON;