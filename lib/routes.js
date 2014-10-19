var db = require('./db')
  , pipes = require('./pipes')
  , process = require('./process')
  , async = require('async')
  ;

function harvest (req, res, next) {
  var states
    , url
    ;

  states = ['ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi',
            'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma',
            'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm',
            'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd',
            'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];

  function series (state) {
    if (state) {
      url = process.buildHarvestUrl(state);
      console.log('Currently scraping:', url);
      pipes.pipeUsgsResponse(url, function (err) {
        if (err) return res.send(new Error(err), 500);
        return series(states.shift());
      })
    } else {
      async.waterfall([
        function (callback) {
          db.reduceRecords('harvest', function (err, data) {
            if (err) return next(new Error(err));
            else callback(null, data);
          })
        },
        function (data, callback) {
          db.createRecords('geojson', data, function (err) {
            if (err) return next(new Error(err));
            callback(null);
          })
        },
        function (callback) {
          db.reduceMerge('geojson', function (err) {
            if (err) return next(new Error(err));
            else callback(null);
          })
        },
        function (callback) {
          db.singleGeoJsonDoc('joined', function (err, res) {
            if (err) return next(new Error(err));
            callback(null, res);
          })
        },
        function (data, callback) {
          db.createRecords('record', data, function (err) {
            if (err) return next(new Error(err));
            callback(null);
          })
        }
      ], function (err) {
        if (err) return next(new Error(err));
        else return res.send(200);
      })
    }
  }

  series(states.shift());
}

function getDocument (req, res, next) {
  db.getAllDocs('record', function (err, result) {
    if (err) return next(new Error(err));
    return res.json(result, 200);
  })
}

exports.harvest = harvest;
exports.getDocument = getDocument;