var latlng = require('./fmLatLng');
var log = require('./fmLog');

var rad = function(x) {
    return x * Math.PI / 180;
};

function getDist(p1, p2) {
    if(typeof p1.lat !== 'function'){
        return getDistXY(p1.lat,p1.lng,p2.lat,p2.lng);
    }
    var R = 6378137; // Earth’log mean radius in meter
    var dLat;
    var dLong;
    // try{
        dLat = rad(p2.lat() - p1.lat());
        dLong = rad(p2.lng() - p1.lng());
    // }catch (e){
    //     //log(e);
    //     try{
    //         dLat = rad(p2.lat - p1.lat);
    //         dLong = rad(p2.lng - p1.lng);
    //     }catch (e){
    //         log(e);
    //     }
    // }
    // try {
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        d = Math.round(d * 100) / 100;
        //log("Distance:" + d);
    // }catch (e){
    //     log("Error in distance calculation " + e );
    // }
    return d; // returns the distance in meter
};

function getDistXY(x1,y1,x2,y2) {
    var R = 6378137; // Earth’log mean radius in meter
    var dLat = rad(x2 - x1);
    var dLong = rad(y2 - y1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(x1)) * Math.cos(rad(x2)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = Math.round(d * 100) / 100;
    return d; // returns the distance in meter
};

module.exports = getDist;