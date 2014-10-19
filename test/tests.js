var supertest = require('supertest')
  , server = require('./../server/server')
  ;

describe('Tests', function () {
/*
  describe('Harvest USGS JSON for all 50 states to GeoJSON', function () {
    this.timeout(150000000);
    it('should return 200 when posting to the server', function (done) {
      supertest(server)
        .post('/usgs-water/harvest')
        .expect(200, done)
    })
  });
*/
  describe('Get reduced GeoJson object from the database', function () {
    it('should return 200 when getting from the server', function (done) {
      supertest(server)
        .get('/usgs-water/data')
        .expect(200, done)
    })
  })
});