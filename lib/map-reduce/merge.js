function streamFlowMap () {
  if (this.value.properties.variables[0].variableCode === '00065') {
    emit(this.value.properties.siteCode, this)
  }
}

function gageHeightMap () {
  if (this.value.properties.variables[0].variableCode === '00060') {
    emit(this.value.properties.siteCode, this.value.properties.variables[0]);
  }
}

function reduce (key, values) {
  var result;

  result = {};
  result.geometry = {};
  result.properties = {};
  result.properties.variables = [];

  result.geometry.type = 'Point';

  values.forEach(function (value) {
    if (value.geometry) {
      result.geometry = value.geometry;
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
    if (value.properties.variables.length === 1) {
      result.properties.variables.push(value.properties.variables[0]);
    }
  });

  return result;
}