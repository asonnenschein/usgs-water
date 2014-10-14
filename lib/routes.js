var db = require('./db')
  , pipes = require('./pipes')
  , process = require('./process')
  , async = require('async')
  ;

function harvest (req, res, next) {
  var states
    , state
    , url
    , i
    ;

  states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi',
            'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma',
            'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm',
            'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd',
            'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];

  for (i = 0; i < states.length; i++) {
    state = states[i];
    url = process.buildHarvestUrl(state);

    async.waterfall([
      function (callback) {
        pipes.pipeUsgsResponse(url, function (data) {
          if (data) callback(null, data);
        })
      },
      function (data, callback) {
        db.createRecords('harvest', data, function (err, res) {
          if (err) return next(new Error(err));
          else callback(res);
        })
      },
      function (callback) {
        db.reduceRecords('harvest', function (err, data) {
          if (err) return next(new Error(err));
          else callback(null, data);
        })
      },
      function (data, callback) {
        db.createRecords('geojson', data, function (err, res) {
          if (err) return next(new Error(err));
          else callback(res);
        })
      },
      function (callback) {
        db.reduceMerge('geojson', function (err, res) {
          if (err) return next(new Error(err));
          else callback(null, 'done');
        })
      }
    ], function (err, result) {
      if (err) return next(new Error(err));
      else return res.send(result, 200);
    })
  }

}

/*
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
*/

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