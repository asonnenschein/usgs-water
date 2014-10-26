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

var svg = d3.select(app.map.getPanes().overlayPane).append('svg');
var g = svg.append('g').attr('class', 'leaflet-zoom-hide');

d3.json(app.serviceUrl, function (err, res) {
  if (err) console.log(err);

  var i, gage, stream, gageNoData, streamNoData;
  var scaledData = [];
  for (i = 0; i < res.length; i++) {
    gage = parseFloat(res[i].properties.gageHeight.value);
    gageNoData = parseFloat(res[i].properties.gageHeight.noDataValue);
    stream = parseFloat(res[i].properties.streamFlow.value);
    streamNoData = parseFloat(res[i].properties.streamFlow.noDataValue);
    if (gage !== gageNoData && stream !== streamNoData) {
      var ratio = Math.abs(stream / gage);
      if (ratio && ratio !== Infinity) {
        res[i].properties.ratio = ratio;
        scaledData.push(ratio);
      }
      else delete res[i];
    }
  }

  var max = Math.max.apply(null, scaledData);
  var min = Math.min.apply(null, scaledData);

  var classes = 9;
  var schemeId = 'Blues';
  var scheme = colorbrewer[schemeId][classes];

  var bboxArray = [["-192.000", "-7.000"], ["-44.000", "79.000"]];

  var path = d3.geo.path().projection(project);

  var feature = g.selectAll('circle')
    .data(res)
    .enter().append('svg:circle')
    .attr('cx', function (d) {
      if (d && d.properties.ratio)
        return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]
    })
    .attr('cy', function (d) {
      if (d && d.properties.ratio)
        return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]
    })
    .style('stroke', scheme[classes - 1])
    .style('fill', function (d) {
      if (d && d.properties.ratio) {
        var ratio = d.properties.ratio;
        if (ratio > 50) return scheme[classes - 1];
        if (ratio > 10 && ratio <= 50) return scheme[classes - 2];
        if (ratio > 5 && ratio <= 10) return scheme[classes - 3];
        if (ratio > 4 && ratio <= 5) return scheme[classes - 4];
        if (ratio > 3 && ratio <= 4) return scheme[classes - 5];
        if (ratio > 2 && ratio <= 3) return scheme[classes - 6];
        if (ratio > 1 && ratio <= 2) return scheme[classes - 7];
        if (ratio > 0 && ratio < 1) return scheme[classes - 8];
      }
    })
    .style('opacity', 0.9)
    .attr('r', function (d) {
      if (d) return 5
    })
  ;

  function project (x) {
    var point = app.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y]
  }

  function reset () {
    bottomLeft = project(bboxArray[0]);
    topRight = project(bboxArray[1]);

    svg
      .attr('width', topRight[0] - bottomLeft[0])
      .attr('height', bottomLeft[1] - topRight[1])
      .style('margin-left', bottomLeft[0] + 'px')
      .style('margin-top', topRight[1] + 'px')
    ;

    g.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');

    feature
      .attr('cx', function (d) {
        if (d && d.properties.ratio)
          return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]
      })
      .attr('cy', function (d) {
        if (d && d.properties.ratio)
          return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]
      })
      .attr('r', function (d) {
        if (d && d.properties.ratio) {
          return app.map.getZoom()
        }
      })
    ;

    feature.attr('d', path);
  }
  app.map.on('viewreset', reset);
  reset();
});