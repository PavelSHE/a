var distance = require('./fmDist');
var config = require('./config.json');
var log = require('../system/fmLog');
var HashMap = require('hashmap');
var fmService = require('../system/fmService');
var ArrayList = require('arraylist');

function fmGlobal(){
    this.servicesHash = new HashMap();
    this.currentID = 1;
};
fmGlobal.prototype.constructor = fmGlobal;

fmGlobal.prototype.addService = function addService(geox,geoy,perimeter,address,name) {
    addService.class= this.constructor.name;
    var id = this.currentID++;
    if (address === "")
        address = config.hosting_service + id;
    this.servicesHash.set(id,new fmService(geox, geoy, perimeter, address,name));
    log("fmSID:" + id + " created (" + address + ")");
};



//function returns closest service points
fmGlobal.prototype.getServers = function getServers(lat , lng) {
    getServers.class= this.constructor.name;
    var res = new ArrayList();
    //log("in getServers, m_x: " + m_x + " m_y: " + m_y);
    this.servicesHash.forEach(function (service, index)
    {
        // log("in getServers, service, address: " + service.address + " x: " + service.x + " y: " + service.y + " p: " + service.p);
        // log("in getServers, service, address: " + service.address +
        //     " MIN X: " + (service.x-((0.5*service.p)/100)) +
        //     " MAX X: " + (service.x+((0.5*service.p)/100)) +
        //     " MIN Y: " + (service.y-((0.5*service.p)/100)) +
        //     " MAX Y: " + (service.y+((0.5*service.p)/100)) );
        //
        // //limit by distance
        // if( (m_x < service.x+((0.5*service.p)/100)) && (m_x > service.x-((0.5*service.p)/100))
        //     && (m_y < service.y+((0.5*service.p)/100)) && (m_y > service.y-((0.5*service.p)/100)) ) {
        //
        //     res.add(service.address);
        //     log("in getServers, GOT service.address: " + service.address);
        //
        // }
        if (service.isInService(lat,lng)){
            res.add(service.address);
        }
    });
    return res;
};
fmGlobal.prototype.getAllServers = function getAllServers() {
    getAllServers.class= this.constructor.name;
    var res = new ArrayList();
    this.servicesHash.forEach(function (service, index)
    {
        res.add(service.getInfo());
    });
    return res;
};

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value)
{
    return Value * Math.PI / 180;
}

module.exports = fmGlobal;