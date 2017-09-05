function fmLatLng(lat,lng) {
    this.lat = parseFloat(lat);
    this.lng = parseFloat(lng);
}
fmLatLng.prototype.lat =  function () {
    return this.lat;
};
fmLatLng.prototype.lng = function () {
    return this.lng;
};

module.exports = fmLatLng;