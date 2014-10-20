var db = require('./db')
  , pipes = require('./pipes')
  , mongo = require('./mongo-config')
  , exec = require('child_process').exec
  , async = require('async')
  ;

function buildHarvestUrl (state) {
  var baseUrl = 'http://waterservices.usgs.gov/nwis/iv/?'
    , format = 'format=json'
    , stateCd = '&stateCd=' + state
    , parameters = '&parameterCd=00065,00060'
    ;

  return baseUrl + format + stateCd + parameters;
}

function harvest (callback) {
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
      url = buildHarvestUrl(state);
      console.log('Currently scraping:', url);
      pipes.pipeUsgsResponse(url, function (err) {
        if (err) return res.send(new Error(err), 500);
        return series(states.shift());
      })
    } else {
      async.waterfall([
        function (callback) {
          db.reduceRecords('harvest', function (err, data) {
            if (err) callback(err);
            else callback(null, data);
          })
        },
        function (data, callback) {
          db.createRecords('geojson', data, function (err) {
            if (err) callback(err);
            callback(null);
          })
        },
        function (callback) {
          db.reduceMerge('geojson', function (err) {
            if (err) callback(err);
            else callback(null);
          })
        },
        function (callback) {
          db.singleGeoJsonDoc('joined', function (err, res) {
            if (err) callback(err);
            callback(null, res);
          })
        },
        function (data, callback) {
          db.createRecords('record', data, function (err) {
            if (err) callback(err);
            callback(null);
          })
        }
      ], function (err) {
        if (err) callback(err);
        else callback(null);
      })
    }
  }
  series(states.shift());
}

function empty (callback) {
  var model
    , collections
    ;

  collections = ['harvest', 'geojson', 'joined', 'record'];

  function series (collection) {
    model = mongo.getCollection(collection) || null;
    if (collection && model) {
      db.emptyCollection(collection, function (err) {
        if (err) callback(err);
        console.log('Emptied collection:', collection);
        return series(collections.shift());
      })
    } else {
      callback(null);
    }
  }
  series(collections.shift());
}

function subprocess () {
  console.log('Start subprocess empty, harvest and reduce');
  async.waterfall([
    function (callback) {
      var cmd = 'usgs-water -e';
      exec(cmd, function (err, stdout, stderr) {
        if (err) callback(err);
        if (stderr) callback(stderr);
        callback(null);
      })
    },
    function (callback) {
      var cmd = 'usgs-water -a';
      exec(cmd, function (err, stdout, stderr) {
        if (err) callback(err);
        if (stderr) callback(stderr);
        callback(null);
      })
    }
  ], function (err) {
    if (err) console.log(err);
  })
}

exports.harvest = harvest;
exports.empty = empty;
exports.getDocument = getDocument;
exports.subprocess = subprocess;