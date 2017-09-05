var stats = new Object();
stats.tableA = new Object();
stats.tableB = new  Object();
stats.charts = new Object();
stats.total = new Object();
stats.lastData = null;
stats.url = 'http://localhost:3000/fms/services/';
stats.pollFrequency = 3000;
stats.precision = 2;
stats.currency = ' NIS';


//totals
stats.total.saved = 0;
stats.total.costRegular = 0;
stats.total.costFome = 0;
stats.total.carsRunning = 0;
stats.total.carsRemoved = 0;
stats.total.carsChanged = 0;


//charts
stats.charts.id = 'curve_chart';
stats.charts.id2 = 'chart2';
stats.charts.id3 = 'lineChart';
stats.charts.id4 = 'pie_carsRR';
stats.charts.id5 = 'pie_carsRC';
stats.charts.id6 = 'line_carsRR';
stats.charts.id7 = 'efficiencyAll';
stats.charts.data = [['seconds', 'Regular Cost', 'FoMe Cost'],[0,0,0]];
stats.charts.data2 = [[0,0,0]];
stats.charts.data4 = [['Type','#'],['',''],['','']];
stats.charts.data5 = [['Type','#'],['',''],['','']];
stats.charts.data6 = [];
stats.charts.data7 = [];
stats.charts.maxDataSize = 40;
stats.charts.counter = 1;
stats.charts.updateFrequency = 1;
stats.charts.updateFrequency6 = 10;
stats.charts.updateFrequency7 = 10;
//tables
stats.tableA.id = '#statsA';
stats.tableA.fields = ['Name','Latitude','Longitude','Perimeter','# Live cars','# Removed cars','Drive Regular cost','Drive FoMe cost','SAVINGS','Distance'];
stats.tableB.id = '#statsB';
stats.tableB.fields  =['Name','Address','Average Fuel Liter Cost','Average Fuel Consumption','Average Drafting Effectiveness','Average Cost Additional Above Cruise','Up Time'];
stats.tableA.fill = function(){
    //console.log("filling table " + this.id);
    var data = new Array(stats.lastData.length);
    stats.total.costRegular = 0;
    stats.total.costFome = 0;
    stats.total.saved = 0;
    stats.total.carsRunning = 0;
    stats.total.carsRemoved = 0;
    stats.total.carsChanged = 0;
    var r3 = 0;
    for (var i = 0 ; i< stats.lastData.length ;i++){
        var item = new Array(this.fields.length);
        var row = stats.lastData[i];
        //console.log(row);
        item[0] = row.name;
        item[1] = row.lat;
        item[2] = row.lng;
        item[3] = row.p*2 +  ' KM';
        stats.total.carsRunning += parseInt(row.runningCars);
        item[4] = row.runningCars;
        stats.total.carsRemoved  += parseInt(row.removedCars);
        item[5] = row.removedCars;

        var a =  parseFloat(row.removedCarsRegular) + parseFloat(row.runningCarsRegular);
        stats.total.costRegular +=  a;
        item[6] = a.toFixed(stats.precision) + stats.currency;

        var b = parseFloat(row.removedCarsFome) + parseFloat(row.runningCarsFome);
        stats.total.costFome += b;
        item[7] = b.toFixed(stats.precision) + stats.currency;


        item[8] = parseFloat(a - b).toFixed(stats.precision) + stats.currency;

        var c = row.removedCarsDistance + row.runningCarsDistance;
        r3 += c;
        item[9] = c/100 + " KM";
        //console.log(item.toString());

        data[i] = item;
        stats.total.saved += (a - b);
        stats.total.carsChanged += parseInt(row.carsChanged);
    }

    //sums:
    var item = new Array(this.fields.length);
    item[0] = '';
    item[1] = '';
    item[2] = '';
    item[3] = 'Summary:';
    item[4] = '<b>' + stats.total.carsRunning  + '</b>';
    item[5] = '<b>' + stats.total.carsRemoved; + '</b>';
    item[6] = '<b>' + stats.total.costRegular.toFixed(stats.precision) + stats.currency  + '</b>';
    item[7] = '<b>' + stats.total.costFome.toFixed(stats.precision) + stats.currency  + '</b>';
    item[8] = '<div style=color:red>' + (stats.total.costRegular - stats.total.costFome).toFixed(stats.precision) + stats.currency + '</div>';
    item[9] = '<b>' + r3/100 + " KM"  + '</b>';
    data.push(item);

    data.forEach(function (row) {
        addRow(stats.tableA.id,row);
    });


};
stats.tableB.fill = function () {
    //console.log("filling table " + this.id);
    var data = new Array(this.fields.length);

    for (var i = 0 ; i< stats.lastData.length ;i++){
        var item = new Array(this.fields.length);
        var row = stats.lastData[i];
        item[0] = row.name;
        item[1] = row.address;
        item[2] = (row.average.literCost).toFixed(stats.precision) + stats.currency;
        item[3] = (row.average.consamptionPerKmInLiters).toFixed(stats.precision) + ' liter to KM';
        item[4] = (row.average.fomeEffectiveCofficientPercent).toFixed(stats.precision) + ' %';
        item[5] = (row.average.consamptionPerKmInPercentAboveCruise*100).toFixed(stats.precision) + ' %';
        item[6] =  msToTime((new Date().getTime()) - row.stamp);
        data[i] = item;
    }

    data.forEach(function (row) {
        addRow(stats.tableB.id,row);
    });
};



$( document ).ready(function() {
    poll();
    var t = setInterval(function () {
        poll();
        if (stats.charts.counter%stats.charts.updateFrequency === 0){

            //graphic data
            stats.charts.data2.push([stats.charts.counter,
                //parseFloat(Math.round(stats.total.costRegular*100)/100).toFixed(stats.precision),
                //parseFloat(Math.round(stats.total.costFome*100)/100).toFixed(stats.precision)]);
                parseFloat(stats.total.costRegular),
                parseFloat(stats.total.costFome)]);
            //console.log(stats.charts.data2.toString());
            //drawChart(stats.charts.data);
            //drawChart2(stats.charts.data2);
            if (stats.charts.data2.length > stats.charts.maxDataSize){
                stats.charts.data2.shift();
            }
            //pies data
            stats.charts.data4[1] = ['Running',parseInt(stats.total.carsRunning )];
            stats.charts.data4[2] = ['Removed',parseInt(stats.total.carsRemoved )];
            stats.charts.data5[1] = ['Cars manipulated',parseInt(stats.total.carsChanged )];
            stats.charts.data5[2] = ['Cars only registered',parseInt(stats.total.carsRemoved) + parseInt(stats.total.carsRunning)- parseInt(stats.total.carsChanged )];

            if (stats.charts.counter%stats.charts.updateFrequency6 === 0){
                stats.charts.data6.push(
                    [stats.charts.counter,
                        parseFloat(stats.total.carsRunning),
                        parseFloat(stats.total.carsRemoved)]
                )
                drawChart6(stats.charts.data6);

            };

            if (stats.charts.counter%stats.charts.updateFrequency7 === 0){
                stats.charts.data7.push(
                    [stats.charts.counter,
                        stats.total.saved*100/stats.total.costRegular]
                )
                drawChart7(stats.charts.data7);

            };


            drawChart3(stats.charts.data2);
            drawPie(stats.charts.data4,'Cars statistics ('+ (parseInt(stats.total.carsRemoved) + parseInt(stats.total.carsRunning)) + ')',stats.charts.id4);
            drawPie(stats.charts.data5,' ',stats.charts.id5);
        }
        stats.charts.counter++;
    },stats.pollFrequency);

    google.charts.load('current', {'packages':['corechart','line']});
    //google.charts.setOnLoadCallback(drawChart);
});

function poll() {
    $.ajax({
        type: "GET",
        url: stats.url,
        success: function (data) {
            //console.log ("poll success");
            stats.lastData = data;
            createTable(stats.tableA);
            createTable(stats.tableB);
        },
        failure: function(errMsg) {
            console.log(errMsg);
        }
    });
}

// function act() {
//     //poll(createTable(tableA,fieldsA,fillTableA),createTable(tableB,fieldsB,fillTableB));
//     poll();
// }

function createTable(table) {
    var ht = '<tr>';
    for(i =0; i< table.fields.length;i++){
        ht = ht + '<th>' + table.fields[i] + '</th>';
    };
    ht = ht + '</tr>';

    $(document).find(table.id).html("");
    $(document).find(table.id).append(ht);

    table.fill();
}



function addRow(tableID,row) {
    var ht = '<tr>';
    for(i =0; i< row.length;i++){
        ht = ht + '<td>' + row[i] + '</td>';
    };
    ht = ht + '</tr>';
    $(document).find(tableID).append(ht);
}



function drawChart(data) {
    var data = google.visualization.arrayToDataTable(
        data
    );

    var options = {
        title: 'System Cost Performance, Total savings : '+  stats.total.saved.toFixed(stats.precision) + '('+ +')' ,
        curveType: 'function',
        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById(stats.charts.id));
    chart.draw(data, options);
}

function drawChart2(rowsData) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Regular');
    data.addColumn('number', 'FoMe');

    data.addRows(rowsData);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Cost'
        },
        series: {
            1: {curveType: 'function'}
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById(stats.charts.id2));
    chart.draw(data, options);
}

function drawChart3(rowsData) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Regular');
    data.addColumn('number', 'FoMe');

    data.addRows(rowsData);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Cost'
        },
        chart: {
            title: 'Cost time line',
            subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
                (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
            ) +'% )'
        },
        width: 900,
        height: 500
    };

    var chart = new google.charts.Line(document.getElementById(stats.charts.id3));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart6(rowsData) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Running');
    data.addColumn('number', 'Removed');

    data.addRows(rowsData);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Cars'
        },
        chart: {
             title: 'Cars in system  time line'//,
            // subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
            //     (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
            // ) +'% )'
        },
        width: 900,
        height: 500
    };

    var chart = new google.charts.Line(document.getElementById(stats.charts.id6));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawChart7(rowsData) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Efficiency');
    //data.addColumn('number', 'Removed');

    data.addRows(rowsData);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: '% saved'
        },
        chart: {
            title: 'Efficiency time line'//,
            // subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
            //     (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
            // ) +'% )'
        },
        width: 900,
        height: 500
    };

    var chart = new google.charts.Line(document.getElementById(stats.charts.id7));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function drawPie(rows,name,id) {
    var data = google.visualization.arrayToDataTable(rows);
    var options = {
        title: name,
        is3D: true,
    };
    var chart = new google.visualization.PieChart(document.getElementById(id));
    chart.draw(data, options);
}

function msToTime(s) {

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}
