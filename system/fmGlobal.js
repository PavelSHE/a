var distance = require('./fmDist');
var config = require('./config.json');
var log = require('../system/fmLog');
var HashMap = require('hashmap');
var fmService = require('../system/fmService');
var ArrayList = require('arraylist');

function fmGlobal(){
    this.servicesHash = new HashMap();
    this.currentID = 0;
    this.locked = false;
    var me = this;

    var t = setInterval(function () {
        me.clearServices();
    },config.serviceMaxIdleSeconds*1000);
};
fmGlobal.prototype.constructor = fmGlobal;


fmGlobal.prototype.clearServices = function clearServices(){
    this.locked = true;
    clearServices.class = this.constructor.name;

    var was10 = new Date().getTime() - config.serviceMaxIdleSeconds*1000;
    var me = this;
    this.servicesHash.forEach(function (service) {
        if (service.id > 0){
            if((was10 - service.lastCarRemoval)> 0 && service.carsHash.size === 0 && service.locked === false){
                try {
                    var stat = me.servicesHash.get(0);
                    stat.removedCars += service.removedCars;
                    stat.removedCarsRegular += service.removedCarsRegular;
                    stat.removedCarsFome += service.removedCarsFome;
                    stat.removedCarsDistance += service.removedCarsDistance;
                    stat.carsChanged += service.carsChanged;
                    stat.average.consamptionPerKmInLiters += (service.average.consamptionPerKmInLiters + stat.average.consamptionPerKmInLiters )/2;
                    stat.average.literCost += (service.average.literCost + stat.average.literCost)/2;
                    stat.average.fomeEffectiveCofficientPercent += (service.average.fomeEffectiveCofficientPercent + stat.average.fomeEffectiveCofficientPercent )/2;
                    stat.average.consamptionPerKmInPercentAboveCruise += (service.average.consamptionPerKmInPercentAboveCruise + stat.average.consamptionPerKmInPercentAboveCruise)/2;
                    log("Service " + service.id + " removed");
                    me.servicesHash.delete(service.id);
                }catch (e){
                    console.log(e);
                }
            }
        }
    });

    this.locked = false;
};


fmGlobal.prototype.addService = function addService(geox,geoy,perimeter,name,address) {
    this.locked = true;
    addService.class= this.constructor.name;
    var test = false;
    this.servicesHash.forEach(function (service) {
       if (service.lat === geox && service.lng === geoy){
           test = true;
       }
    });
    if (test === true )
        return;

    var id = this.currentID++;
    if (name === undefined)
        name = "AutoCover" + id;
    if (address === undefined)
        address = config.hosting_service + id;
    this.servicesHash.set(id,new fmService(id,geox, geoy, perimeter, address,name));
    log("fmSID:" + id + " created (" + address + ")");
    this.locked = false;
};

// fmGlobal.prototype.addService = function addService(north, south, east,west,name,address) {
//
//
//
//     this.servicesHash.set(id,new fmService(north, south, east,west,address));
//
// };


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
fmGlobal.prototype.reset = function reset() {
    if (this.locked === true )
        return;
    reset.class= this.constructor.name;
    //var me = this;
    //
    this.servicesHash = new HashMap();

    this.addService( 1,1,0,"StatisticsServer");
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