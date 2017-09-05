var log = require('./fmLog');
var car  = require('./fmCar');
var HashMap = require('hashmap');
var ArrayList = require('arraylist');
var protocol = require('./protocol.json');
var config = require('./config.json');
var dist = require('./fmDist');
var distXY = require('./fmDistXY');
var latlng = require('./fmLatLng');
var instruction = require('./fmInstruction');

function fmService(id,lat,lng,p,address,name){
    //geo x , geo y , service radius
    this.id = id;
    this.name = name;
    this.carsHash = new HashMap();
    this.lat = lat;
    this.lng = lng;
    this.p = p;
    this.bounds = new Object();
    this.bounds.east = lat +((0.5*p)/100);
    this.bounds.west = lat -((0.5*p)/100);
    this.bounds.north = lng + ((0.5*p)/100);
    this.bounds.south = lng - ((0.5*p)/100);
    this.stamp = new Date().getTime();

    this.address = address;
    var me = this;
    var t = setInterval(function () {
        me.clearCars();

    },config.clearCarSeconds*1000);

    //statistics
    this.removedCars = 0;
    this.removedCarsRegular = 0;
    this.removedCarsFome = 0;
    this.removedCarsDistance = 0;
    this.carsChanged = 0;

    this.average = new Object();
    this.average.consamptionPerKmInLiters = 0;
    this.average.literCost = 0;
    this.average.fomeEffectiveCofficientPercent = 0;
    this.average.consamptionPerKmInPercentAboveCruise = 0
    this.lastCarRemoval = 0;
    this.locked = false;
}



fmService.prototype.constructor = fmService;

fmService.prototype.getInfo = function getInfo() {
    var me = this;
    getInfo.class = me.constructor.name;
    var result = new Object();
    result.name = me.name;
    result.lat = me.lat;
    result.lng = me.lng;
    result.p = me.p;
    result.bounds = me.bounds;
    result.address = me.address;
    result.stamp = me.stamp;
    result.removedCars = me.removedCars;
    result.removedCarsRegular = me.removedCarsRegular;
    result.removedCarsFome = me.removedCarsFome;
    result.removedCarsDistance = me.removedCarsDistance;
    result.carsChanged = me.carsChanged;
    result.runningCars = 0;
    result.runningCarsRegular = 0;
    result.runningCarsFome = 0;
    result.runningCarsDistance = 0;
    result.average = me.average;

    this.carsHash.forEach(function collectCarInfo(car,i) {
        if (car.state !== protocol.new  && car.state !== protocol.route  ){
            collectCarInfo.class = me.constructor.name;
            result.runningCars++;
            result.runningCarsRegular += parseFloat(car.fuel.cost.regular);
            result.runningCarsFome += parseFloat(car.fuel.cost.fome);
            result.runningCarsDistance += car.traveledMeters;
        }
    });

    return result;
};

fmService.prototype.processCar = function processCar(requester) {
    processCar.class = this.constructor.name;
    var tempID = requester.id.toString().toUpperCase();
    var t;
    if (t = this.carsHash.get(tempID)){
        //log(tempID + " updating");
        t.set(requester,this);
    }
    else{
        //log(tempID + " creating");
        this.carsHash.set(tempID,new car(tempID,requester.lat,requester.lng))
    }
    return this.carsHash.get(tempID);
};

fmService.prototype.getCarByID = function getCarByID(id) {
    getCarByID.class = this.constructor.name;
    var tempID = id.toString().toUpperCase();
    var t;
    if (t = this.carsHash.get(tempID)){
        return t;
    }
    else{
        return null;
    }
};

fmService.prototype.getCars = function getCars(id) {
    getCars.class= this.constructor.name;
    var res = new ArrayList();
    var temp;
    this.carsHash.forEach(function (c,i) {
        if ((temp = c.get()).id !== id)
            res.add(temp);
        //res.add(c.id,)
    });
    return res;
};

fmService.prototype.clearCars = function clearCars() {
    this.locked = true;
    if (this.id === 0) return;
    clearCars.class = this.constructor.name;
    log(this.address + " cars not updated " + config.clearCarSeconds + " seconds , will be removed");
    var now = new Date().getTime();
    var was10 = new Date().getTime() - config.clearCarSeconds*1000;
    var me = this;
    this.carsHash.forEach(function carRemove(car,i) {
        carRemove.class = me.constructor.name;
        try{
            if ((was10 - car.stamp)> 0 || car.state === protocol.notServiced){
                me.removedCars ++;
                me.removedCarsRegular += parseFloat(car.fuel.cost.regular);
                me.removedCarsFome += parseFloat(car.fuel.cost.fome);
                me.removedCarsDistance += parseFloat(car.traveledMeters);
                me.carsHash.delete(car.id.toUpperCase());
                log( 'car ' + car.id + ' removed');
                me.lastCarRemoval = new Date().getTime();
            }
        }
        catch (e){
            log(e);
        }
    });
    this.locked = false;
};


fmService.prototype.isInService = function isInService(lat,lng){
    isInService.class= this.constructor.name;

    // var x = parseFloat(lat);
    // if (x > this.bounds.north){
    //     return false;
    // }
    // if (x < this.bounds.south){
    //     return false;
    // }
    // var y = parseFloat(lng);
    // if (y > this.bounds.east){
    //     return false;
    // }
    // if (y > this.bounds.west){
    //     return false;
    // }
    var x = parseFloat(lng);
    if (x < this.bounds.west){
        return false;
    }
    if (x > this.bounds.east){
        return false;
    }
    var y = parseFloat(lat);
    if (y < this.bounds.south){
        return false;
    }
    if (y > this.bounds.north){
        return false;
    }
    return true;

};


fmService.prototype.poll = function poll(requester) {
    //change of car state only here
    poll.class = this.constructor.name;

    if (this.isInService(parseFloat(requester.lat),parseFloat(requester.lng)) === false){
        //remove car if exist
        //return refresh services
        log("car not in service");
        var t = this.getCarByID(requester.id);
        if(t !== null){
            t.state = protocol.notServiced; //will be cleaned in clean job
        }
        return instruction('notServiced');
    }

    log(requester.id + " polling " + this.address);
    var car = this.processCar(requester);
    switch (car.state){
        case protocol.new:
            car.state = Object.assign(protocol.route);
            return instruction('route');
            break;
        case protocol.route:
            //log("if route attached store and process");
            //this.processPostedGates(requester,car);
            car.state = Object.assign(protocol.continue);
            return instruction('continue');
            break;
        case protocol.continue:
            //check if car changed speed an projection
           // if (requester.gates !== 'undefined' )
             //   this.processPostedGates(requester,car);

            if(car.instruction.code === protocol.changeSpeed.message.code ){ // if found a match and instruction to change speed applied
                car.state = Object.assign(protocol.guidedDrive);
                return car.instruction;
            }
            this.findPlatoon(car);
            return instruction('continue');
            break;
        case protocol.guidedDrive:
            if (car.guided === "false"){
                car.instruction = instruction('continue');
                car.state = Object.assign(protocol.continue);
                return instruction('continue');
            }
            if(car.instruction !== null){
                return car.instruction;
            }
            return instruction('continue');
            break;
        default:
            return instruction('continue');
    }
};

// fmService.prototype.processPostedGates = function processPostedGates(data,car){
//     processPostedGates.class = this.constructor.name;
//     try {
//         //log("Received gates from " + car.id);
//         var gates = JSON.parse(data.gates);
//         //console.log(gates.length);
//         //console.log(gates[0].lat);
//         car.gates = gates;
//         //car.state = protocol.continue;
//         //this.findPlatoon(car);
//     }
//     catch(e){
//         log("error:"+ e);
//     }
// };

fmService.prototype.findPlatoon = function findPlatoon(car1){
    findPlatoon.class = this.constructor.name;
    //log("Looking for platoon for " + car1.id);
    var car2;
    var service = this;
    var result = false;
    this.carsHash.forEach(function (car2,i) {
        result = service.carTest(car1,car2);
    },car1);

    // if (result === false){
    //     car1.instruction = instruction('continue');
    // };
};

fmService.prototype.carTest = function carTest(car2,car1) {
    carTest.class= this.constructor.name;
    if (car2.id !== car1.id ){
        if(car2.state === protocol.continue && car2.gates.length > 0  &&
            car1.state === protocol.continue && car1.gates.length > 0 ){

            //log("car1:"+ JSON.stringify(car1.locNow()));
            //log("car2:"+ JSON.stringify(car2.locNow()));
            //log(car1.locNow());
            var pair = 'Pair:{' + car1.id + ',' + car2.id + '} ';
            var distanceBetween = dist(car1.locNow(),car2.locNow());
            if (distanceBetween > config.maxCarsDistance){
                log(pair+ 'is too far: ' + config.maxCarsDistance + '<' + distanceBetween);
            }else{
                log(pair + "distance between now: " + distanceBetween);
                var calcSize = Math.min(car1.lastGate,car2.lastGate);
                if(calcSize < config.minimalGatesForCalculation){
                    log(pair + "not enough distance.");
                    return false;
                }

                var result = new Array(calcSize);


                var distanceA = distanceBetween;
                var gateA = 0;
                for (var i = 0; i< calcSize ; i++ ){
                    result[i] = dist(car1.gates[i],car2.gates[i]);
                    if (result[i] < distanceA){
                        distanceA = result[i];
                        gateA = i;
                    }
                }
                //log(pair + "distances: " + result.toString());

                //exit A - cars ment to meet any way
                if (distanceA < config.distanceVariation){
                    log("cars were supposed to meet any way");
                    car1.instruction =  instruction('changeSpeed');
                    car1.instruction.speed = config.carMaintainSame;
                    car1.instruction.platoonID = car2.id;
                    car1.instruction.end = (protocol.route.message.split)*gateA;
                    car2.instruction = instruction('changeSpeed');
                    car2.instruction.speed = config.carMaxSpeedUp;
                    car2.instruction.platoonID = car1.id;
                    car2.instruction.end = (protocol.route.message.split)*gateA;
                    return true;
                }


                //exit B - cars need to change speed
                var limit = result.length -1 ;
                if((result.length)%2==0) {limit =  result.length};
                var radian = 0;
                for (i = 0; i< limit ; i+=2 ){
                    radian = radian +result[i] - result[i+1];
                }
                radian= Math.abs(radian);
                //log( pair + "radian: " + radian );
                if (radian > config.radianLimit){
                    log(pair + "routes not fit, radian: " + radian);
                }else{

                    var comparingGate = Math.min(config.comparingGate,car1.lastGate,car2.lastGate);
                    var comparePoint = car1.gates[comparingGate];
                    //var dist1 = dist(comparePoint,car1.locNow());
                    //var dist2 = dist(comparePoint,car2.locNow());
                    var dist1 = comparingGate*(protocol.route.message.split); //this is my gate
                    var dist2 = dist(comparePoint,car2.locNow());
                    var leadingCar;
                    var followingCar;
                    if (dist1 < dist2){ //car1 is closer to comparing point
                        //log(pair + car1.id + " is leading");
                        leadingCar = car1;
                        followingCar = car2;
                    }else {
                        //log(pair + car2.id + " is leading");
                        leadingCar = car2;
                        followingCar = car1;
                    }

                    // var gateDistance;
                    // var closestGate;
                    // for(var i = 0 ; i<followingCar.gates.length;i++){
                    //     if (i === 0 ){ //init val
                    //         gateDistance = dist(followingCar.gates[i],leadingCar.locNow());
                    //     }else{
                    //         var d = dist(followingCar.gates[i],leadingCar.locNow());
                    //         if (d < gateDistance){
                    //             gateDistance = d;
                    //             closestGate = i;
                    //         }
                    //     }
                    // }

                    //prepare instructions
                    var instructionLeading = instruction('changeSpeed');
                    var instructionFollowing = instruction('changeSpeed');
                    instructionLeading.speed = config.carMaxSlowDown;
                    instructionFollowing.speed = config.carMaxSpeedUp;
                    instructionLeading.platoonID = followingCar.id;
                    instructionFollowing.platoonID = leadingCar.id;


                    var distanceB = distanceBetween*
                        (instructionLeading.speed + leadingCar.speed)/
                        ((instructionFollowing.speed + followingCar.speed) -
                            (instructionLeading.speed + leadingCar.speed));

                    instructionLeading.end = distanceB;
                    instructionFollowing.end = distanceB + distanceBetween;

                    //var roadDistanceBetween = (closestGate + 1) *(protocol.route.message.split);
                    // var meetingPoint = roadDistanceBetween*
                    //     (leadingCar.instruction.speed + leadingCar.speed)/
                    //     (followingCar.instruction.speed + followingCar.speed);

                    // var distanceB = roadDistanceBetween*
                    //     (leadingCar.instruction.speed + leadingCar.speed)/
                    //     ((followingCar.instruction.speed + followingCar.speed) -
                    //         (leadingCar.instruction.speed + leadingCar.speed));


                    //exit B validation
                    var gateL = leadingCar.gateAt( instructionLeading.end );
                    var gateF = followingCar.gateAt(instructionFollowing.end);
                    var distanceAtMeeting = dist(leadingCar.gates[gateL],followingCar.gates[gateF]);
                    if( distanceAtMeeting >= config.distanceVariation){
                        log(pair + "routes not fit - distanceAtMeeting:" + distanceAtMeeting);
                        return false;
                    }else{
                        //check if effective?
                        // leadingCar.instruction =  instruction('changeSpeed');
                        // //leadingCar.instruction.message.speed = config.carMaxSlowDown;
                        // leadingCar.instruction.speed = config.carMaxSlowDown;
                        // leadingCar.instruction.platoonID = followingCar.id;
                        // leadingCar.instruction.end = distanceB;
                        // followingCar.instruction = instruction('changeSpeed');
                        // followingCar.instruction.speed = config.carMaxSpeedUp;
                        // followingCar.instruction.platoonID = leadingCar.id;
                        // followingCar.instruction.end = distanceB + roadDistanceBetween;

                        //efficiency validation
                        //costs calculation
                        log(pair + "routes fit. Checking cost effectiveness.");
                        var norma = followingCar.fuel.consamptionPerKmInLiters/1000*instructionFollowing.end; //regular use
                        var limit_cost = norma *
                            (100 + instructionFollowing.speed*followingCar.fuel.consamptionPerKmInPercentAboveCruise)/
                                100 - norma;
                        //saving calculation
                        var gatesForCalculation = Math.min((followingCar.gates.length - gateF -1),(leadingCar.gates.length - gateL - 1));
                        var limit_saving = 0 ,n;
                        var chunk = protocol.route.message.split;
                        norma = followingCar.fuel.consamptionPerKmInLiters/1000*chunk;
                        for (var i = 0 ; i<gatesForCalculation;i++){
                            n = dist(leadingCar.gates[gateL+i],followingCar.gates[gateF+i]);
                            if(n<(distanceAtMeeting + (config.distanceVariation/2))){
                                limit_saving += (norma -  norma * (100 - followingCar.fuel.fomeEffectiveCofficientPercent)/100);
                            }
                        }
                        if (limit_saving>limit_cost){
                            log (pair + "speed changes can save " + (limit_saving-limit_cost));
                            this.carsChanged +=2;
                            leadingCar.instruction = instructionLeading;
                            followingCar.instruction = instructionFollowing;
                            return true;
                        }
                        else{
                            log(pair + "speed changes not effective , cost of changes:"+
                                limit_cost + " saving via following:" + limit_saving);
                            return false;
                        }


                    }
                }
            }
        }
    }
    return false;
};


module.exports = fmService;
