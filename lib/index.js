var http = require('http');

module.exports = {
  usgsReq: function(url) {
    http.get(url, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        var blob = JSON.parse(data);
        console.log(blob.value.timeSeries);
      })
    })
  }
};