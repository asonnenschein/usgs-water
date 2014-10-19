function streamFlowMap () {
  if (this.value.properties.variables[0].variableCode === '00065') {
    emit(this.value.properties.siteCode, this)
  }
}

function gageHeightMap () {
  if (this.value.properties.variables[0].variableCode === '00060') {
    emit(this.value.properties.siteCode, this);
  }
}

function reduce (key, values) {
  var result;

  result = {};
  result.geometry = {};
  result.properties = {};
  result.properties.streamFlow = {};
  result.properties.gageHeight = {};

  result.geometry.type = 'Point';

  values.forEach(function (value) {
    var value
      , stream
      , gage;

    value = value.value;
    if (value.geometry.coordinates) {
      result.geometry.coordinates = value.geometry.coordinates;
    }
    if (value.properties.record) {
      result.properties.record = value.properties.record;
    }
    if (value.properties.site) {
      result.properties.site = value.properties.site;
    }
    if (value.properties.srs) {
      result.properties.srs = value.properties.srs;
    }
    if (value.properties.siteCode) {
      result.properties.siteCode = value.properties.siteCode;
    }
    if (value.properties.variables[0].variableCode === '00065') {
      stream = value.properties.variables[0];
      result.properties.streamFlow = {
        variableCode: stream.variableCode,
        noDataValue: stream.noDataValue,
        value: stream.value,
        timeStamp: stream.timeStamp
      };
    }
    if (value.properties.variables[0].variableCode === '00060') {
      gage = value.properties.variables[0];
      result.properties.gageHeight = {
        variableCode: gage.variableCode,
        noDataValue: gage.noDataValue,
        value: gage.value,
        timeStamp: gage.timeStamp
      };
    }
  });

  return result;
}

exports.streamFlowMap = streamFlowMap;
exports.gageHeightMap = gageHeightMap;
exports.reduce = reduce;