var time = require('./fmTime');
var log = require('./fmLog');
var ArrayList = require('arraylist');
var protocol = require('./protocol.json');
var latlng = require('./fmLatLng');
var instruction = require('./fmInstruction');
var config = require('./config.json');


function fmCar(id ,lat , lng ) {
    fmCar.class= this.constructor.name;
    this.id = id;
    //this.loc = new ArrayList();
    //this.loc.add({'x':geoX,'y':geoY});
    this.loc =  new latlng(lat,lng);
    this.stamp = new Date().getTime();
    this.state =  Object.assign(protocol.new);
    this.instruction = instruction('continue');
    this.gates = [];
    this.lastGate = 0;
    this.speed = 0;
    this.fuel = new Object();
    this.traveledMeters = 0;
    this.guided = false;
    log("fmCarID:" + this.id + " created :" + JSON.stringify(this));
}

fmCar.prototype.constructor = fmCar;

fmCar.prototype.set = function set(car,service) {
    set.class= this.constructor.name;
    //this.loc.add({'x':geoX,'y':geoY});
    this.loc =  new latlng(car.lat,car.lng);
    this.stamp = new Date().getTime();
    this.gates = (JSON.parse(car.gates)).arr;
    this.lastGate = (JSON.parse(car.gates)).lastGate;
    this.speed = parseInt(car.speed);
    this.fuel = JSON.parse(car.fuel);
    this.traveledMeters = parseInt(car.traveledMeters);
    this.guided = car.guided;
    //log("fmCarID:" + this.id + " updated, guided:"+this.guided+ " speed:" + this.speed + " distance:" + this.traveledMeters + " fuel cost:" + JSON.stringify(this.fuel.cost) );
    //statistics update
    service.average.consamptionPerKmInLiters = (service.average.consamptionPerKmInLiters)*(1-config.averageRatioNew) +
                            parseFloat(this.fuel.consamptionPerKmInLiters)*config.averageRatioNew;
    service.average.literCost = (service.average.literCost)*(1-config.averageRatioNew) +
                            parseFloat(this.fuel.literCost)*config.averageRatioNew;
    service.average.fomeEffectiveCofficientPercent = (service.average.fomeEffectiveCofficientPercent)*(1-config.averageRatioNew) +
                            parseFloat(this.fuel.fomeEffectiveCofficientPercent)*config.averageRatioNew;
    service.average.consamptionPerKmInPercentAboveCruise = (service.average.consamptionPerKmInPercentAboveCruise)*(1-config.averageRatioNew) +
                            parseFloat(this.fuel.consamptionPerKmInPercentAboveCruise)*config.averageRatioNew;
};

fmCar.prototype.locNow = function locNow() {
    locNow.class= this.constructor.name;
    try{
        //var t = new latlng(this.loc.get(0).x,this.loc.get(0).y)
        //return t;
        return this.loc;
    }
    catch (e){
        log("Error in latlng calculation");
    }

};

fmCar.prototype.get = function get() {
    get.class= this.constructor.name;
    var c = new Object();
    c.id = this.id;
    c.loc = this.loc;
    c.stamp = this.stamp;
    return c;
};

fmCar.prototype.gateAt= function gateAt(x) {
    gateAt.class = this.constructor.name;
    var chunk = protocol.route.message.split;
    var gate = parseInt(x/chunk);
    var left = parseInt(x%chunk);
    if (left > (chunk/2)){
        gate++;
    }
    if(gate>this.lastGate){
        return this.lastGate-1;
    }
    return gate;

};

module.exports = fmCar;