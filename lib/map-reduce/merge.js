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
  result.properties.variables = [];

  result.geometry.type = 'Point';

  /*
  if (values.geometry) {
    result.geometry = values.geometry;
  }
  if (values.properties.record) {
    result.properties.record = values.properties.record;
  }
  if (values.properties.site) {
    result.properties.site = values.properties.site;
  }
  if (values.properties.srs) {
    result.properties.srs = values.properties.srs;
  }
  if (values.properties.siteCode) {
    result.properties.siteCode = values.properties.siteCode;
  }
  if (values.properties.variables[0].variable === '00065') {
    result.properties.streamFlow = values.properties.variables[0].variable;
  }
  if (values.properties.variables[0].variable === '00060') {
    result.properties.gageHeight = values.properties.variables[0].variable;
  }
  */

  return result;
}

exports.streamFlowMap = streamFlowMap;
exports.gageHeightMap = gageHeightMap;
exports.reduce = reduce;