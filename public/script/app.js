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
      var ratio = Math.round(Math.abs(stream / gage));
      if (ratio !== Infinity) {
        res[i].properties.ratio = ratio;
        scaledData.push(ratio);
      }
      else delete res[i];
    }
  }

  var max = d3.max(scaledData);

  var bboxArray = [["-192.000", "-7.000"], ["-44.000", "79.000"]];

  var path = d3.geo.path().projection(project);

  var feature = g.selectAll('circle')
    .data(res)
    .enter().append('svg:circle')
    .attr('cx', function (d) {
      if (d)
        return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]
    })
    .attr('cy', function (d) {
      if (d)
        return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]
    })
    .style('stroke', 'red')
    .style('opacity', 0.5)
    .attr('r', function (d) {
      if (d)
        return parseInt(d.properties.ratio) + 1
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
        if (d)
          return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]
      })
      .attr('cy', function (d) {
        if (d)
          return project([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]
      })
      .attr('r', function (d) {
        if (d)
          var scale = (d.properties.ratio / max);
          if (scale <= (max * 0.1)) return 1;
          if (scale <= (max * 0.2)) return 2;
          if (scale <= (max * 0.3)) return 3;
          if (scale <= (max * 0.4)) return 4;
          if (scale <= (max * 0.5)) return 5;
          if (scale <= (max * 0.6)) return 6;
          if (scale <= (max * 0.7)) return 7;
          if (scale <= (max * 0.8)) return 8;
          if (scale <= (max * 0.9)) return 9;
          if (scale == max) return 10;
      })
    ;

    feature.attr('d', path);
  }
  app.map.on('viewreset', reset);
  reset();
});