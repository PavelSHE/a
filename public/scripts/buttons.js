//var simLocations =["Tel Aviv-Yafo, Israel","Jerusalem, Israel","Haifa, Israel","Be'er Sheva, Israel","Ashdod, Israel","Tiberias, Israel","Sderot, Israel","Afula, Israel","Shlomi, Israel"];


function initAutocomplete() {
    // Link UI to JS objects
    var inputSource = document.getElementById('autoDriveSource');
    var searchBoxSource = new google.maps.places.SearchBox(inputSource);
    var inputDestination = document.getElementById('autoDriveDestination');
    var searchBoxDestination = new google.maps.places.SearchBox(inputDestination);
    //pins
    //var markers = [];

    // map.addListener('bounds_changed', function() {
    //     inputSource.setBounds(map.getBounds());
    // });
    //
    // map.addListener('bounds_changed', function() {
    //     inputDestination.setBounds(map.getBounds());
    // });




    //searchBoxSource.addListener('places_changed', function() {change_place(searchBoxSource)});
    searchBoxSource.addListener('places_changed', function() {
        var places = searchBoxSource.getPlaces();
        //console.log(places);
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        // markers.forEach(function(marker) {
        //     marker.setMap(null);
        // });
        // markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            // if (!place.geometry) {
            //     console.log("Returned place contains no geometry");
            //     return;
            // }
            // var icon = {
            //     url: place.icon,
            //     size: new google.maps.Size(71, 71),
            //     origin: new google.maps.Point(0, 0),
            //     anchor: new google.maps.Point(17, 34),
            //     scaledSize: new google.maps.Size(25, 25)
            // };
            //
            // // Create a marker for each place.
            // markers.push(new google.maps.Marker({
            //     map: map,
            //     icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));

            currentSource = place.name;
            console.log("Start: " + place.name);

            // if (place.geometry.viewport) {
            //     // Only geocodes have viewport.
            //     bounds.union(place.geometry.viewport);
            // } else {
            //     bounds.extend(place.geometry.location);
            // }
        });
        //map.fitBounds(bounds);
    });


    searchBoxDestination.addListener('places_changed', function() {
        var places = searchBoxDestination.getPlaces();
        //console.log(places);
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        // markers.forEach(function(marker) {
        //     marker.setMap(null);
        // });
        // markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            // if (!place.geometry) {
            //     console.log("Returned place contains no geometry");
            //     return;
            // }
            // var icon = {
            //     url: place.icon,
            //     size: new google.maps.Size(71, 71),
            //     origin: new google.maps.Point(0, 0),
            //     anchor: new google.maps.Point(17, 34),
            //     scaledSize: new google.maps.Size(25, 25)
            // };
            //
            // // Create a marker for each place.
            // markers.push(new google.maps.Marker({
            //     map: map,
            //     icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));

            currentDestination = place.name;
            console.log("Finish: " + place.name);

            // if (place.geometry.viewport) {
            //     // Only geocodes have viewport.
            //     bounds.union(place.geometry.viewport);
            // } else {
            //     bounds.extend(place.geometry.location);
            // }
        });
        // map.fitBounds(bounds);
    });

}

function drawServiceCoverage(service) {
    console.log(service);
    // var distance = service.p * 1000; //in meters
    // var latlng = new google.maps.LatLng(service.x,service.y);
    // ne = google.maps.geometry.spherical.computeOffset(latlng, (distance/2), 0);
    // ne = google.maps.geometry.spherical.computeOffset(ne, (distance/2), 90);
    // se = google.maps.geometry.spherical.computeOffset(ne, distance, 180);
    // sw = google.maps.geometry.spherical.computeOffset(se, distance, 270);
    // nw = google.maps.geometry.spherical.computeOffset(sw, distance, 0);

    temp = new google.maps.Rectangle({
    map:map,
    strokeColor: '#FF0000',
    strokeOpacity: 0.9,
    strokeWeight: 1,
    fillColor: '#FF0000',
    // bounds:new google.maps.LatLngBounds(sw,ne)
    bounds:{
        north: service.bounds.north,
        south: service.bounds.south,
        east: service.bounds.east,
        west: service.bounds.west
    }
    });
    servicesDrawings.push(temp);
}

function operateServices(){
    if(servicesDrawings.length !== 0)  {
        servicesDrawings.forEach(function (t) { t.setMap(null) });
        servicesDrawings = [];
        $("#services").html("Show services");
    }
    else {
        $.ajax({
            type: "GET",
            url: global_service + "services",
            success: function (data) {
                data.forEach(function (service) {
                    drawServiceCoverage(service);
                })
            },
            failure: function(errMsg) {
                console.log(errMsg);
            }
       });
        $("#services").html("Hide services");
    }

}

function handleAddSimRouteManual() {
    //var log = document.getElementById('log');
    // var inputSource = document.getElementById('autoDriveSource');
    //var searchBoxSource = new google.maps.places.SearchBox(inputSource);
    //var inputDestination = document.getElementById('autoDriveDestination');
    //var searchBoxDestination = new google.maps.places.SearchBox(inputDestination);
    //var places = searchBoxSource.getPlaces();
    //places.forEach(function(place){

    //alert(document.getElementById('autoDriveSource').textContent);
    //});

    if (!(currentSource == null || currentDestination == null)){
        //log.textContent  = currentSource + " -> " + currentDestination;

        var route = new simRoute(currentSource,currentDestination);

        //startLoc.push(currentSource);
        //endLoc.push(currentDestination);
        //clear currents
        currentDestination = null;
        currentSource = null;
        document.getElementById('autoDriveSource').value = '';
        document.getElementById('autoDriveDestination').value = '';

    }

}

function handleAddSimRouteRandom() {
    var start;
    var end;
    do {
        end = simLocations[getRandomInt(0,simLocations.length)];
        start = simLocations[getRandomInt(0,simLocations.length)];
    }
    while (end == start || end == null || start == null);
    var route = new simRoute(start,end);
    //route.drawRoute(route);
}

function demo_run(start,end) {
    var route = new simRoute(start,end);
    return route;
}

function demo() {
    // end = simLocations[1];
    // start = simLocations[0];
    // demo1(start,end);
    var start = 'Gan Sorek,Israel';
    var end = 'Givat Hen, Israel';
    var a = demo_run(start,end);
    a.silent = false;

    var start1 = "Giv'at ha-Ilanot, Beit Hanan";
    var end1  = 'Givat Hen, Israel';
    var b;
    setTimeout(function () {
        b = demo_run(start1,end1);
        b.silent = false;
    }, 3000);
    //"Ha-Manhigim Garden, Jabotinsky Street, Rishon LeTsiyon, Israel"
}

function demo1() {
    var start = 'Afula,Israel';
    var end = 'Hadera, Israel';
    demo_run(start,end);

    var start1 = "Afula,Israel";
    var end1  = 'Nir Yaffe, Israel';
    setTimeout(function () {
        demo_run(start1,end1);
    }, 20000);
    var start2 = 'Megiddo Airfield, Jezreel Valley, Israel';
    var end2 = 'Dar al-Hanun';
    setTimeout(function () {
        demo_run(start2,end2);
    }, 55000);
}

function demo2() {
    var start = 'Geva Carmel, Israel';
    var end = 'Merkaz Meirav, Israel';
    demo_run(start, end);
}

function clearData(){
    console.log("All routes removed");
    simRoutes.forEach(function (value) {
        //console.log(value);
        value.unDraw();
    })
    simRoutes = new Array();
}


function changeSpeed(x) {
    simulationOperator.change(x);
    $("#simSpeed").html(simulationOperator.get());
}
// //
function setDefaultSpeed() {
    simulationOperator.setDefault();
    $("#simSpeed").html(simulationOperator.get());
}


function continiuosRandomization(){
    if (randomizationRunning == true){
        console.log("Pausing randomization");
        randomizationRunning = false;
        $("#continuos_operator").html("Continue randomizator");
        //document.getElementById('sim_operator').value = 'Start';
    }else {
        console.log("Starting randomization");
        randomizationRunning = true;
        randomizationStep();
        $("#continuos_operator").html("Pause randomizator");
    }

    var t = setInterval(function () {
        randomizationStep();
    },randomizationTick);
}

function randomizationStep() {
    if (randomizationRunning === true) {
        var now = simRoutes.getRunning();
        console.log("Now running " + now);
        var val = getRandomInt(randomizationMin,randomizationMax);
        if (val > now){
            var size = val - now;
            if (randomizationLeft > 0){
                return;
            }else{
                randomizationLeft = size;
                console.log("Adding " + size + ' cars');
                for (var i =0 ; i<size;i++){
                    setTimeout(function () {
                        handleAddSimRouteRandom();
                        randomizationLeft--;
                    }, (3000*i));
                }
            }

        }
    }
}