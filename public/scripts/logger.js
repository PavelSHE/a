
var table = '#logs';
var fields = ['Time','Car ID','Message'];

$( document ).ready(function() {
    //console.log( "ready!" );
    createTable(table,fields,fillTable);
});

function createTable(tableID,fields,next) {
    //console.log( "creating table in " + tableID );
    //tableID = '#'+ tableID;
    // var e = $(elementID);
    // e.text
    //$(elementID).text("aaaaa");
    //var $(document.createElement('table'));
    //$(elementID).append('<table id = "'+ table +'"' +'></table>');
    var ht = '<tr>';
    for(i =0; i< fields.length;i++){
        ht = ht + '<th>' + fields[i] + '</th>';
    };
    ht = ht + '</tr>';
    console.log(ht);
    $(document).find(tableID).append(ht);

    next(tableID);
}

function fillTable(tableID) {
    console.log("filling from server");
    var data = [['a','b','c'],['a','b','c']];

    data.forEach(function (row) {
        addToLogs(tableID,row);
    });

}

function addToLogs(tableID,row) {
    console.log("putt data");
    var ht = '<tr>';
    for(i =0; i< row.length;i++){
        ht = ht + '<td>' + row[i] + '</td>';
    };
    ht = ht + '</tr>';
    $(document).find(tableID).append(ht);
}