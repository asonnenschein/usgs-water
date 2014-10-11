var db = require('./db')
  , pipes = require('./pipes')
  , async = require('async')
  ;

function harvest (url) {
  async.waterfall([
    function (callback) {
      pipes.pipeUsgsResponse(url, function (data) {
        if (data) {
          db.createRecords('harvest', data, function (err, res) {
            if (err) throw err;
            else callback(res);
          })
        }
      })
    },
    function (callback) {

    }
  ])
}

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

function mergeGeoJSONRecords () {
  db.reduceMerge('geojson');
}

exports.harvest = harvest;
exports.reduceToGeoJSON = reduceToGeoJSON;
exports.mergeGeoJSONRecords = mergeGeoJSONRecords;