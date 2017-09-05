
var theSize = 400;

var backgroundColor = '#f9f9f9';

$( document ).ready(function() {
    google.charts.load('current', {'packages':['corechart','line']});
    var t = setInterval(function () {
        if (stats.charts.counter%stats.charts.updateFrequency === 0){

            //graphic data
            stats.charts.data2.push([stats.charts.counter,
                parseFloat(stats.total.costRegular),
                parseFloat(stats.total.costFome)]);
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

                drawChartOne(stats.charts.data2,['X','Running','Removed'],'Time','Cars',"Cars in system time line","",stats.charts.id6,theSize*2,theSize);

            };

            if (stats.charts.counter%stats.charts.updateFrequency7 === 0){
                stats.charts.data7.push(
                    [stats.charts.counter,
                        stats.total.saved*100/stats.total.costRegular]
                )
                drawChartOne(stats.charts.data7,['X','Efficiency'],'Time','% saved',"Efficiency time line","",stats.charts.id7,theSize*2,theSize);

            };


            var sub = 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
                    (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
                ) +'% )';
            drawChartOne(stats.charts.data2,['X','Regular','FoMe'],'Time','Cost','Cost time line',sub,stats.charts.id3,theSize*2,theSize);
            drawPie(stats.charts.data4,'Cars statistics ('+ (parseInt(stats.total.carsRemoved) + parseInt(stats.total.carsRunning)) + ')',stats.charts.id4, theSize,theSize);
            drawPie(stats.charts.data5,' ',stats.charts.id5,theSize,theSize);
        }
        stats.charts.counter++;
    },stats.pollFrequency);


});





// function drawChart(data) {
//     var data = google.visualization.arrayToDataTable(
//         data
//     );
//
//     var options = {
//         title: 'System Cost Performance, Total savings : '+  stats.total.saved.toFixed(stats.precision) + '('+ +')' ,
//         curveType: 'function',
//         legend: { position: 'bottom' }
//     };
//
//     var chart = new google.visualization.LineChart(document.getElementById(stats.charts.id));
//     chart.draw(data, options);
// }

// function drawChart2(rowsData) {
//     var data = new google.visualization.DataTable();
//     data.addColumn('number', 'X');
//     data.addColumn('number', 'Regular');
//     data.addColumn('number', 'FoMe');
//
//     data.addRows(rowsData);
//
//     var options = {
//         hAxis: {
//             title: 'Time'
//         },
//         vAxis: {
//             title: 'Cost'
//         },
//         series: {
//             1: {curveType: 'function'}
//         }
//     };
//
//     var chart = new google.visualization.LineChart(document.getElementById(stats.charts.id2));
//     chart.draw(data, options);
// }

function drawChartOne(rowsData,axis,hAxisName,vAxisName,title,sub,chartID,width,height) {
    var data = new google.visualization.DataTable();
    axis.forEach(function (t) {
        data.addColumn('number', t);
    })
    // data.addColumn('number', 'X');
    // data.addColumn('number', 'Regular');
    // data.addColumn('number', 'FoMe');

    data.addRows(rowsData);

    var options = {
        hAxis: {
            title: hAxisName
        },
        vAxis: {
            title: vAxisName
        },
        chart: {
            title: title,
            subtitle:sub
        },
        width: width,
        height: height,
        backgroundColor:backgroundColor
    };

    var container = document.getElementById(chartID);
    if (container !== null){
        var chart = new google.charts.Line(container);
        chart.draw(data, google.charts.Line.convertOptions(options));
    }
}


// function drawChart3(rowsData) {
//     var data = new google.visualization.DataTable();
//     data.addColumn('number', 'X');
//     data.addColumn('number', 'Regular');
//     data.addColumn('number', 'FoMe');
//
//     data.addRows(rowsData);
//
//     var options = {
//         hAxis: {
//             title: 'Time'
//         },
//         vAxis: {
//             title: 'Cost'
//         },
//         chart: {
//             title: 'Cost time line',
//             subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
//                 (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
//             ) +'% )'
//         },
//         width: 900,
//         height: 500
//     };
//
//     var container = document.getElementById(stats.charts.id3);
//     if (container !== null){
//         var chart = new google.charts.Line(container);
//         chart.draw(data, google.charts.Line.convertOptions(options));
//     }
// }
// function drawChart6(rowsData) {
//     var data = new google.visualization.DataTable();
//     data.addColumn('number', 'X');
//     data.addColumn('number', 'Running');
//     data.addColumn('number', 'Removed');
//
//     data.addRows(rowsData);
//
//     var options = {
//         hAxis: {
//             title: 'Time'
//         },
//         vAxis: {
//             title: 'Cars'
//         },
//         chart: {
//             title: 'Cars in system  time line'//,
//             // subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
//             //     (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
//             // ) +'% )'
//         },
//         width: 900,
//         height: 500
//     };
//
//     var chart = new google.charts.Line(document.getElementById(stats.charts.id6));
//     chart.draw(data, google.charts.Line.convertOptions(options));
// }
//
// function drawChart7(rowsData) {
//     var data = new google.visualization.DataTable();
//     data.addColumn('number', 'X');
//     data.addColumn('number', 'Efficiency');
//     //data.addColumn('number', 'Removed');
//
//     data.addRows(rowsData);
//
//     var options = {
//         hAxis: {
//             title: 'Time'
//         },
//         vAxis: {
//             title: '% saved'
//         },
//         chart: {
//             title: 'Efficiency time line'//,
//             // subtitle: 'Total savings : '+  stats.total.saved.toFixed(stats.precision) + ' ( ' + (
//             //     (stats.total.saved*100/stats.total.costRegular).toFixed(stats.precision)
//             // ) +'% )'
//         },
//         width: 900,
//         height: 500
//     };
//
//     var chart = new google.charts.Line(document.getElementById(stats.charts.id7));
//     chart.draw(data, google.charts.Line.convertOptions(options));
// }

function drawPie(rows,name,id,width,height) {
    var data = google.visualization.arrayToDataTable(rows);
    var options = {
        title: name,
        is3D: true,
        width: width,
        height: height,
        backgroundColor:backgroundColor
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
