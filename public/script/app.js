var root = this;
root.app == null ? app = root.app = {} : app = root.app;

app.serviceUrl = 'http://127.0.0.1:3000/usgs-water/data.json';

app.initialExtent = L.latLngBounds(
  [50.919376, -130.227639],
  [21.637598, -65.891701]
);

app.mapOptions = {
  attributionControl: true,
  minZoom: 2
};

app.map = L.map('map', app.mapOptions).fitBounds(app.initialExtent);

app.baseMap = new app.views.TileLayerView({
  model: new app.models.TileLayer({
    id: 'osm-basemap',
    serviceUrl: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
    active: true,
    layerOptions: {
      subdomains: '1234',
      attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">'
        + 'MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetm'
        + 'ap.org">OpenStreetMap</a> contributors, <a href="http://creative'
        + 'commons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      detectRetina: true
    }
  })
}).render();

d3.json(app.serviceUrl, function (err, res) {
  if (err) console.log(err);
  app.waterView = new app.views.WaterView({
    model: new app.models.GeoJSONLayer({
      data: res,
      layerOptions: {
        pointToLayer: function (f, ll) {
          var markerOptions = {
            radius: 8,
            fillColor: 'red',
            detectRetina: true
          };
          return L.circleMarker(ll, markerOptions);
        }
      }
    })
  }).render();
});