var mocha = require('mocha')
  , supertest = require('supertest')
  , server = require('./../lib/server')
  ;

describe('Tests', function () {

  describe('Harvest USGS JSON for all 50 states to GeoJSON', function (done) {
    var req = {

    };

    supertest(server)
      .post()
      .send(req)
      .expect(200, done)
  })

});