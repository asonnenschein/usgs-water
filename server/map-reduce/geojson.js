function map () {
  var doc
    , attrs;

  doc = {};
  doc.geometry = {};
  doc.properties = {};
  doc.type = 'Feature';

  doc.geometry.type = 'Point';
  doc.geometry.coordinates = [
    this.sourceInfo.geoLocation.geogLocation.longitude,
    this.sourceInfo.geoLocation.geogLocation.latitude];

  doc.properties.record = 'usgs-water';
  doc.properties.id = this.name;
  doc.properties.site = this.sourceInfo.siteName;
  doc.properties.srs = this.sourceInfo.geoLocation.geogLocation.srs;
  doc.properties.siteCode = this.sourceInfo.siteCode[0].value;

  attrs = {};
  if (this.values[0].value[0]) {
    attrs.variableCode = this.variable.variableCode[0].value || 'undefined';
    attrs.variableUnit = this.variable.unit.unitAbbreviation || 'undefined';
    attrs.noDataValue = this.variable.noDataValue.toString() || 'undefined';
    attrs.value = this.values[0].value[0].value || 'undefined';
    attrs.timeStamp = this.values[0].value[0].dateTime || 'undefined';
  }

  doc.properties.variables = [];
  doc.properties.variables.push(attrs);

  emit(this._id, doc);
}

function reduce (key, values) {
  return key;
}

exports.map = map;
exports.reduce = reduce;