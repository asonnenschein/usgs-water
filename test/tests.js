var supertest = require('supertest')
  , server = require('./../lib/server')
  ;

describe('Tests', function () {

  describe('Harvest USGS JSON for all 50 states to GeoJSON', function () {
    this.timeout(150000000);
    it('should return 200 when posting to the server', function (done) {
      supertest(server)
        .post('/usgs-water/harvest')
        .expect(200, done)
    })
  });

});