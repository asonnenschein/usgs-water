function buildHarvestUrl (state) {
  var baseUrl = 'http://waterservices.usgs.gov/nwis/iv/?'
    , format = 'format=json'
    , stateCd = '&stateCd=' + state
    , parameters = '&parameterCd=00065,00060'
    ;

  return baseUrl + format + stateCd + parameters;
}

exports.buildHarvestUrl = buildHarvestUrl;