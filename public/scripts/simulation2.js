
// function handleAddSimRouteManual() {
//     //var log = document.getElementById('log');
//     // var inputSource = document.getElementById('autoDriveSource');
//     //var searchBoxSource = new google.maps.places.SearchBox(inputSource);
//     //var inputDestination = document.getElementById('autoDriveDestination');
//     //var searchBoxDestination = new google.maps.places.SearchBox(inputDestination);
//     //var places = searchBoxSource.getPlaces();
//     //places.forEach(function(place){
//
//     //alert(document.getElementById('autoDriveSource').textContent);
//     //});
//
//     if (!(currentSource == null || currentDestination == null)){
//         //log.textContent  = currentSource + " -> " + currentDestination;
//
//         var route = new simRoute(currentSource,currentDestination);
//
//         //startLoc.push(currentSource);
//         //endLoc.push(currentDestination);
//         //clear currents
//         currentDestination = null;
//         currentSource = null;
//         document.getElementById('autoDriveSource').value = '';
//         document.getElementById('autoDriveDestination').value = '';
//
//     }
//
// }
// function handleAddSimRouteRandom() {
//     var start;
//     var end;
//     do {
//         end = simLocations[getRandomInt(0,simLocations.length)];
//         start = simLocations[getRandomInt(0,simLocations.length)];
//     }
//     while (end == start || end == null || start == null);
//     var route = new simRoute(start,end);
//     //route.drawRoute(route);
// }
// function abc() {
//     end = simLocations[1];
//     start = simLocations[0];
//     var route = new simRoute(start,end);
// }
//
// function clearData(){
//     console.log("All routes removed");
//     simRoutes.forEach(function (value) {
//         //console.log(value);
//         value.unDraw();
//     })
//     simRoutes = new Array();
// }
//
// var global_service = "http://localhost:3000/fms/";

var simRoutes = new Array();
var simBaseID = "10000000";
var simulationOperator = {
    current:0,
    default:1000,
    ticks:0,
    operator: new Object(),
    get: function () {
        return this.current;
    },
    start: function(){
        console.log("Starting simulation");
        this.current = 0 + this.default;
        var me = this;
        me.operator = setInterval(function () {
            simStep();
            me.tick();
        },parseInt(me.current));
    },
    pause: function () {
        console.log("Pausing simulation");
        var me = this;
        clearInterval(me.operator);
        me.current = 0;
        //me.tick();
    },
    change: function (x) {
        var me = this;
        if ((me.current + x ) <= 0){
            me.pause();
            return;
        }
        console.log("Changing simulation speed from " +  me.current + " to " + (me.current+x));
        me.current+=x;
        clearInterval(me.operator);
        me.operator = setInterval(function () {
            simStep();
            me.tick();
        },this.current)
    },
    setDefault: function () {
        var me = this;
        console.log("Changing simulation speed to default " +  me.default);
        me.current=me.default;
        clearInterval(me.operator);
        me.operator = setInterval(function () {
            simStep();
            me.tick();
        },me.current)
    },
    isSimulationRunning: function () {
        if (this.current>0){
            return true;
        }else{
            return false;
        }
    },
    tick: function () {
        var me = this;
        me.ticks++;
        //console.log("tick:" + me.ticks);
    }
}

simRoutes.getById = function getById(id) {
    var result = null;
    this.forEach(function (route) {
        //me.log(route);
        if (route.ID === id) {
            //console.log(route.ID);
            result =  route;
        }
    });
    return result;
};

simRoutes.getRunning = function getRunning() {
    var result = 0;
    this.forEach(function (route) {
        if (route.readyToDrive === true) {
            result++;
        }
    });
    return result;
};

function getID() {
    return simBaseID++;
}


function getColor(id){
    return '#FFFF' + (id%100 + 10);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simRoute(start,end,map) {
    this.log = function (message) {
        if (!this.silent){
            if(this.lastLogMessage !== message){
                console.log("ID:" + this.ID + ": " + message);
            }
        }
        this.lastLogMessage = message;
    }
    function getDirections(thisRoute, callback) {
        if (thisRoute.directionsResponce != null) {
            return thisRoute.directionsResponce;
        }
        else {
            directionsService = new google.maps.DirectionsService();
            var request = {
                origin: thisRoute.start,
                destination:thisRoute.end,
                travelMode: thisRoute.travelMode
            };
            thisRoute.log("Getting directions");
            directionsService.route(request,setDirectionsCallback(thisRoute,callback));
        }
    }
    function setDirectionsCallback (thisRoute,callback){
        return function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                thisRoute.log("Directions received , saving...");
                thisRoute.directionsResponce = response;
                callback(thisRoute);
            }
        }
    }

    this.drawRoute = function() {
    //toDO - fix Line visualisation
        this.log("Drawing on map");
        function addMarker(sim_route, next) {
            for (i=0;i<sim_route.legs.length;i++){
                if (i == 0) {
                    //put marker on start
                    sim_route.startLocation.latlng = sim_route.legs[i].start_location;
                    sim_route.startLocation.address = sim_route.legs[i].start_address;
                    sim_route.marker = createMarker(sim_route.legs[i].start_location,("ID:"+ sim_route.ID),sim_route.legs[i].start_address);
                    //sim_route.marker = createMarker(sim_route.start +">"+sim_route.end,("ID:"+ sim_route.ID),sim_route.legs[i].start_address);
                }
                var steps = sim_route.legs[i].steps;
                for (j=0;j<steps.length;j++) {
                    var nextSegment = steps[j].path;
                    for (k=0;k<nextSegment.length;k++) {
                        sim_route.polyline.getPath().push(nextSegment[k]);
                    }
                }
            }
            next;
        };

        function putOnMap(sim_route) {
            sim_route.polyline.setMap(map);
            sim_route.visible = true;
        };

        addMarker(this,putOnMap(this));

        this.visible = true;
    }

    this.move = function() {
        var me = this;
        if (me.distancePassed < me.polyline.Distance()) {
            //me.log("moving " + me.speed +"m forward");

            //update marker
            me.distancePassed = me.distancePassed + me.speed.get();
            var p = me.polyline.GetPointAtDistance(me.distancePassed);
            me.marker.setPosition(p);

            //consumption update
            me.fuel.add(me.speed.get());

            //guided and following
            if (this.guided === true){
                if (this.platoon.nearCarCommCanBeUsed() === true){
                    if(me.platoon.wasFollowing()){
                        //i am a following car all comm thru local communication
                        me.followerRoutine(parseInt(me.platoon.id));
                    }else{
                        //i am a leader or i am separated from platoon
                        if (this.fuel.fomeFollowing){
                            me.followerRoutine();
                        }else{
                            me.leadPlatoon();
                        }
                    }
                }else{
                    this.platoon.reduceDistance();
                }
            }


            if(me.servers.length === 0 ){
                me.log("Getting servers");
                me.getServers();
            }else {
                //todo remove servers that not answering
                me.servers.forEach(function (url,id) {
                        //me.log("Contacting " + url);
                        me.poll(url);
                },me);
            }
        }else{
            me.log("finished my route simulation");
            me.readyToDrive = false;
        }



        //this.log("in " + this.getCurrentPosition().toString());
        // if (!me.hasOwnProperty('servers')) {
        //     me.log("Getting servers");
        //     me.getServers();
        // }else {
        //     //todo remove servers that not answering
        //     me.servers.forEach(function (url,id) {
        //             me.log("Asking cars at: " + url);
        //             me.getCars(url);
        //         },me);
        // }


        // if (me.hasOwnProperty('servers') && !me.following && Object.keys(me.carsAround).length === 0) {  //&& this.queryRunner === 0){
        //     me.servers.forEach(function (url,id) {
        //         me.log("Asking cars at: " + url);
        //         me.getCars(url);
        //     },me);
        // };

        //if we have cars contact them directly and ask their poly
        // if (Object.keys(me.carsAround).length > 0 ){
        //     Object.keys(me.carsAround).forEach(function (key) {
        //         var car2 = me.carsAround[key]
        //         // iteration code
        //         //me.log("comparing to" + car.ID);
        //         me.simRouteTest(car2);
        //     })
        // }


    };
    this.followerRoutine = function (leaderID) {

        var me = this;
        if (leaderID === undefined){
            me.log("Continue following routine.");
        }else{
            me.log("Starting following routine.");
            me.platoon.myLeaderID = parseInt(leaderID);
        }
        // id = parseInt(id);
        var leader = simRoutes.getById(me.platoon.myLeaderID);
        if (leader !== null){
            var d = dist(leader.getCurrentPosition(),me.getCurrentPosition());
            //if distance - quit guided
            if (d > this.platoon.nearCarCommDistance){
                leader.platoon.clearFollower(me.id);
                me.quitPlatoon("not close enough");
            }else{
                var t = leader.platoon.setFollower(me.id);
                if (t === true){
                    this.speed.set(leader.speed.get()); // equalazing speeds
                    this.fuel.fomeFollowing = true; //setting fuel for saving
                }else{
                    me.quitPlatoon("marked leader already have follower");
                }
            }
        }else{
            //leader gone - quit guided
            me.quitPlatoon("leader not answering");
        }
    };

    this.quitPlatoon = function (message) {
        me.log("leaving platoon - " + message);
        me.guided = false;
        me.speed.default();
        me.servers = [];
        me.platoon.myLeaderID = 0;
        me.platoon.id = 0;
    };
    this.leadPlatoon = function () {
        me.log("Leading platoon");
        me.guided = false;
        me.speed.default();
        me.servers = [];
        me.platoon.myLeaderID = 0;
        me.platoon.id = 0;
    };

    this.getServers = function () {
        var p = this.getCurrentPosition();
        var me = this;
            $.ajax({
                type: "GET",
                url: global_service + p.lat() + '/' + p.lng(),
                success: function (data) {
                    //me.log(data);
                    me.servers = [data[0]];
                    me.log("Servers received :" + data);
                },
                failure: function(errMsg) {
                    me.log(errMsg);
                }
            });
    };

    this.getCurrentPosition = function () {
        var p = this.polyline.GetPointAtDistance(this.distancePassed);
        return p;
    };

    this.getCars = function (url) {
            var p = this.getCurrentPosition();
            var myCar =  new Object();
            myCar.x = p.lat();
            myCar.y = p.lng();
            myCar.id = this.ID;
            var me = this;

            $.ajax({
                type: "POST",
                url: url,
                data: myCar,
                //contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (data) {
                    //me.log('Cars data: ' + JSON.stringify(data));
                    me.setCars(data);

                },
                failure: function(errMsg) {
                    //add( 'Error: '+  errMsg);
                    me.log(errMsg);
                }
            });
        };

    this.poll = function (url) {
        var me = this;
        var p = me.getCurrentPosition();
        if (p !== null){
            var myCar =  new Object();
            myCar.lat = p.lat();
            myCar.lng = p.lng();
            myCar.id = this.ID;
            if (this.gates !== null ){
                //always sending projection to server
                myCar.gates = this.gates;
            }
            myCar.speed = me.speed.get();
            myCar.fuel = JSON.stringify(me.fuel);
            myCar.traveledMeters = me.distancePassed;
            myCar.guided = me.guided;
            myCar.platoon = JSON.stringify(me.platoon);


            $.ajax({
                type: "POST",
                url: url,
                data: myCar,
                dataType: 'json',
                success: function (data) {
                    me.executeInstruction(data);
                },
                failure: function(errMsg) {
                    me.log(errMsg);
                }
            });
        }
    };

    this.executeInstruction = function (instruction) {

        //if (this.instructionLast.code !== instruction.code)
        if(this.printAllInstrucations === true){
            this.log(JSON.stringify(instruction));
        }else{
            if (this.instructionLast.code !== instruction.code){
                this.log(JSON.stringify(instruction));
            }
        }
        if (instruction.id === this.instructionLast.id) return;

        this.instructionLast = instruction;

        switch (instruction.code) {
            case 2:
                this.service_config = new Object();
                this.service_config.split = instruction.split;
                this.service_config.max = instruction.max;
                this.setGates();
                break;
            case 4:
                //this.log("Instructed to continue");
                this.setGates();
                break;
            case 8:
                this.guided = true;
                this.speed.change(instruction.speed);
                this.platoon.setMeetingDistance(instruction.end);
                this.platoon.setID(instruction.platoonID);
                break;
            case 16:

                this.servers = [];
                break;
            default:
                this.log("Unrecognized server code");
        }
    };

    this.setGates = function(){
        var distances = range(this.service_config.split,this.service_config.max,this.service_config.split);
        var result = new Object();
        result.arr = new Array(distances.length);
        result.lastGate = distances.length -1;
        var loc;
        for (var i = 0; i< distances.length ; i++ ){
            loc  = this.locationAt(distances[i]);
            //result[i] = {"lat": loc.lat(),"lng":loc.lng()};

            result.arr[i] = loc;
            if (loc === null && i < result.lastGate){
                result.lastGate = i;
                break;
            }
        }
        this.gates = JSON.stringify(result);

    };

    this.setCars = function (arr) {
        var me = this;
        if (arr.length >0 ){
            //this.log(arr);
            arr.forEach(function (car) {
                me.log("Car to contact :" + JSON.stringify(car));
                me.contactCar(car.id,function (carObject) {
                    var i = car.id.toString().toUpperCase();
                    me.carsAround[i] = carObject;
                },me);
                //me.carsAround[car.id] = me.contactCar(car.id);
            },me);
        }
    };
    this.lastLogMessage = "";
    this.start = start;
    this.end = end;
    this.ID = getID();
    this.travelMode = google.maps.DirectionsTravelMode.DRIVING;
    this.directionsResponce = null;
    this.distancePassed = 0;

    this.rendererOptions = {
        map: map,
        suppressMarkers : true,
        preserveViewport: true
    }
    this.marker = null;
    this.guided = false;
    this.following = false;
    this.visible = false;
    this.readyToDrive = false;
    this.carsAround = {};
    this.silent = true;
    this.printAllInstrucations = false;
    this.servers = [];
    this.gates = null;
    this.service_config = null;

    this.fuel = new Object();
    this.fuel.consamptionPerKmInLiters = 1/(getRandomInt(1,4)); //0.25; // wiki averages 1:6 to 1:2
    this.fuel.literCost = (getRandomInt(3,17))/100 + 7.27;//7.34;
    this.fuel.fomeFollowing = false;
    this.fuel.fomeEffectiveCofficientPercent =  getRandomInt(4,7);   //3; //can variate between 0% to 8%
    this.fuel.consamptionPerKmInPercentAboveCruise =  (getRandomInt(3,5))/10;   //0.5; //approximately 5% of fuel more for every 10KMH
    this.fuel.used = new Object();
    this.fuel.used.regular = 0;
    this.fuel.used.fome = 0;
    this.fuel.used.previous = 0;
    this.fuel.cost = new Object();
    this.fuel.cost.regular = 0;
    this.fuel.cost.fome = 0;
    var me = this;
    this.fuel.add = function(distanceMeters){
        "use strict";
        // for provided distance add used liters and calculate costs
        //fome not changed value is 1;
        //if car speed up ->  consumption changes up to
        var used_r = me.fuel.consamptionPerKmInLiters/1000*distanceMeters;
        var used_f=0;
        var cruise = me.speed.getCruise();
        var speed = me.speed.get();
        var minLinear = me.speed.getLinearLower();
        if (speed === cruise){ //drive with cruise speed no affect
            // if (this.fomeFollowing === true){ //only if the car is following
            //     used_f = used_r - (used_r/100*(me.fuel.fomeEffectiveCofficientPercent));
            // }else{
            //     used_f = used_r;
            // }
                used_f = used_r;
        }else {
            if (speed > cruise){ //drive above cruise speed affect badly
                var dif = me.speed.get() - me.speed.getCruise(); //speed difference
                var used_f = ((dif* me.fuel.consamptionPerKmInPercentAboveCruise + 100)*used_r/100);
            }else{
                if (speed<minLinear){
                    me.log("Non linear consumption level touched - bad");
                    used_f = used_r;
                }else{
                    //todo additional check
                    used_f = used_r; // here the loss is in time
                }
            }
        }

        if (this.fomeFollowing === true){ //only if the car is following
            used_f = used_f - (used_f/100*(me.fuel.fomeEffectiveCofficientPercent));
        }
        // if (used_f !== used_r){
        //     me.log("Consumption change: " + (used_r-used_f).toFixed(simCalculationPrecision)+' r:'+ used_r+ ' f:'+ used_f );
        // }
        // me.fuel.used.regular = (parseInt(me.fuel.used.regular) + parseInt(used_r)).toFixed(simCalculationPrecision);
        // me.fuel.used.fome = (me.fuel.used.fome + used_f).toFixed(simCalculationPrecision);
        // me.fuel.cost.regular = (me.fuel.cost.regular + used_r*me.fuel.literCost).toFixed(simCalculationPrecision);
        // me.fuel.cost.fome = (me.fuel.cost.fome + used_f*me.fuel.literCost).toFixed(simCalculationPrecision);
        me.fuel.used.regular = (parseFloat(me.fuel.used.regular) + parseFloat(used_r)).toFixed(simCalculationPrecision);
        me.fuel.used.fome = (parseFloat(me.fuel.used.fome)+ parseFloat(used_f)).toFixed(simCalculationPrecision);
        me.fuel.cost.regular = (parseFloat(me.fuel.cost.regular) + parseFloat(used_r*me.fuel.literCost)).toFixed(simCalculationPrecision);
        me.fuel.cost.fome = (parseFloat(me.fuel.cost.fome) + parseFloat(used_f*me.fuel.literCost)).toFixed(simCalculationPrecision);

        if(me.fuel.used.previous !== used_f){
            me.log("Consumption change: " + (me.fuel.used.previous-used_f).toFixed(simCalculationPrecision)+' was:'+ me.fuel.used.previous + ' now:'+ used_f );
        }
        me.fuel.used.previous = used_f;
    };

    // metres per tick - system tick is simulationTick
    this.speed = {
        current: 0,
        cruise:50,
        linearLower:38,

        get: function () {
            var a = parseFloat(this.current);
            return a;
        },
        getCruise: function () {
            var b = parseFloat(this.cruise);
            return b;
        },
        default: function () {
            this.set(this.getCruise());
        },
        isRushing: function () {
          if (this.current > this.cruise)
              return true;
          return false;
        },
        getLinearLower: function () {
            var c = parseFloat(this.linearLower);
            return c;
        },
        set: function (metersPerTick) {
            if (metersPerTick !== this.current )
                me.log("Speed update from " + this.current + " to " + metersPerTick);
            this.current = metersPerTick;
        },
        change: function (speed_change) {
            if ((this.current + speed_change) !== this.current )
                me.log("Speed update from " + this.current + " to " + (this.current + speed_change));
            this.current = (parseFloat(this.current) + parseFloat(speed_change)).toFixed(simCalculationPrecision);
            // if(this.current<18) { //minimal speed
            //     this.current = 18;
            // }
            // if(this.current>80) { //maximum speed
            //     this.current = 80;
            // }
            // if(me.service_config !== null){
            //     me.setGates(me.service_config.split,me.service_config.max);
            // }
        }
    };
    this.speed.default();

    this.platoon = {
        dist: 0,
        id: 0,
        myLeaderID:0,
        myFollowerID:0,
        nearCarCommDistance: 70,
        printFrequency:3,
        counter:0,
        setFollower: function (id) {
            if (this.myFollowerID === 0 || this.myFollowerID === id){
                this.myFollowerID = id;
                return true;
            }else{
                return false;
            }
        },
        clearFollower: function (id) {
            if (this.myFollowerID === id){
                this.myFollowerID = 0;
                return true;
            }else{
                return false;
            }
        },
        setID: function (id) {
            this.id = id;
        },
        getID: function () {
            return this.id;
        },
        wasFollowing: function () {
          return me.speed.isRushing();
        },
        setMeetingDistance: function (distanceMeters) {
            this.dist = distanceMeters;
        },
        reduceDistance: function () {
            this.dist = this.dist - me.speed.get();
            this.counter ++;
            if (this.counter%this.printFrequency === 0){
                me.log("distance to meeting : " + this.dist);
            }
            if(this.dist < 0){
                this.dist = 0;
            }
        },
        nearCarCommCanBeUsed: function () {
            if(this.dist < this.nearCarCommDistance && me.guided === true){
                if(this.wasFollowing())
                    me.log( "near platoon car "+ me.platoon.getID());
                return true;
            }
            else return false;
        },


    };

    this.instructionLast = new Object();
    this.instructionLast.id = -1;

    this.log("Adding simulation: from " + start + " to " + end);
    this.log("Sim ID: " + this.ID);
    simRoutes.push(this);
    this.log("Simulation route " + this.ID  + " added");



    getDirections(this,function (thisRoute) {
        thisRoute.log("Have Directions,  init objects");
        thisRoute.route = thisRoute.directionsResponce.routes[0];
        thisRoute.startLocation = new Object();
        thisRoute.endLocation = new Object();
        thisRoute.polyline = new google.maps.Polyline({
            path: [],
            strokeColor: getColor(thisRoute.ID),
            strokeWeight: 3
        });
        //sim_route.travelDistance = this.polyline.Distance()
        thisRoute.path = thisRoute.directionsResponce.routes[0].overview_path;
        thisRoute.legs = thisRoute.directionsResponce.routes[0].legs;

        thisRoute.directionsRenderer = new google.maps.DirectionsRenderer(thisRoute.rendererOptions);
        thisRoute.directionsRenderer.setMap(map);
        thisRoute.directionsRenderer.setDirections(thisRoute.directionsResponce);
        thisRoute.log('Init finished, marking "ready to drive"');
        thisRoute.readyToDrive = true;

    });

    //toDo - should send info to the server and get info from there
    this.contactCar = function (carID,next) {
        //var car = null;
        var  me = this;
        simRoutes.forEach(function (route) {
            //me.log(route);
            if (route.ID.toString().toUpperCase() === carID.toString().toUpperCase())
            {
                next(route);
            }
        },me);
    };

    this.locationAt = function (meters){
        return this.polyline.GetPointAtDistance(this.distancePassed + meters);
    };


    // this.simRouteTest = function (car2) {
    //     var car1 = this;
    //     car1.log("Comparing routes with "+ car2.ID);
    //     var p1 = car1.getCurrentPosition();
    //     var p2 = car2.getCurrentPosition();
    //     var distanceBetween = dist(p1,p2);
    //     car1.log(">"+  car2.ID +" current distance:" + distanceBetween);
    //     var result = new Array(distances.length);
    //     for (i = 0; i< distances.length ; i++ ){
    //         result[i] = dist(car1.locationAt(distances[i]),car2.locationAt(distances[i]));
    //     }
    //     //car1.log(result);
    //
    //     //decisions maker
    //     if (distanceBetween > 1000){
    //         car1.log("We are too far...");
    //         //toDo- remove far car
    //     }
    //     else{
    //         //toDo - calculate SLOPE //currently simple calculation version
    //         var limit = result.length -1 ;
    //         var radian = 0;
    //         if((result.length)%2==0) {limit =  result.length};
    //         for (i = 0; i< limit ; i+=2 ){
    //             radian = radian +result[i] -result[i+1]
    //         }
    //         car1.log(">"+car2.ID + " radian:" + radian );
    //         var radLimit = 150;
    //         if (radian < radLimit && radian> (radLimit*(-1)) ){
    //             car1.log("BINGO - car "+ car2.ID + " can be used for chain for next " + distances[distances.length-1]/1000 + "km");
    //             var comparePoint = 800;
    //             var dist1 = car1.locationAt(comparePoint);
    //             var dist2 = car2.locationAt(comparePoint);
    //             if (dist1<dist2){
    //                 car1.log("i'll wait for :" + car2.ID);
    //                 car2.following = true;
    //             }
    //             else{
    //                 car1.log("i'll rush to :" + car2.ID);
    //                 car1.following = true;
    //             }
    //         }
    //     }
    //
    // }

}

function createMarker(latlng, label, html) {
// alert("createMarker("+latlng+","+label+","+html+","+color+")");
    var contentString = '<b>'+label+'</b><br>'+html;
    var icon = {
        url: "/icons/livraison.png", // url
        scaledSize: new google.maps.Size(20, 30), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5,
        //icon: icon
    });
    // var marker = new Marker({
    //     map: map,
    //     position: latlng,
    //     icon: {
    //         fillColor: '#00CCBB',
    //         fillOpacity: 1,
    //         strokeColor: '',
    //         strokeWeight: 0
    //     },
    //
    // map_icon_label: '<span class="map-icon map-icon-point-of-interest"></span>'
    //});
    marker.myname = label;


    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map,marker);
    });
    return marker;
}

var rad = function(x) {
    return x * Math.PI / 180;
};

var dist = function(p1, p2) {
    var R = 6378137; // Earth’log mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = Math.round(d * 100) / 100
    return d; // returns the distance in meter
};

function operateSimulation(){
    // if (simulationRunning == true){
    //     console.log("Pausing simulation");
    //     simulationRunning = false;
    //     $("#sim_operator").html("Continue");
    //     //document.getElementById('sim_operator').value = 'Start';
    //
    // }else {
    //     console.log("Starting simulation");
    //     simulationRunning = true;
    //     $("#sim_operator").html("Pause");
    // }
    //
    // simOperator = setInterval(function () {
    //     simStep();
    // },simulationTick);
    if (simulationOperator.isSimulationRunning() == true){
        simulationOperator.pause();
        $("#sim_operator").html("Continue");
    }else{
        simulationOperator.start();
        $("#sim_operator").html("Pause");
    }
}

function simStep() {
    //if (simulationRunning == true){
    if (simulationOperator.isSimulationRunning()){
        // if (route.visible == false ){
        //     route.drawRoute(route);
        // }
        simRoutes.forEach(function (route) {
            if (route !== null){
                if (!route.visible && route.readyToDrive){
                    route.drawRoute(route);
                }
                if (route.readyToDrive)
                    route.move();
            }
        })
    }
}

function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}