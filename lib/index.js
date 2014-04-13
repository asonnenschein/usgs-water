var request = require("request");
    url = require("url");

var cleanUrl = function(usgsUrl) {
  var parsedUrl = url.parse(usgsUrl, true, true);
  return parsedUrl;
};

exports.cleanUrl = cleanUrl;