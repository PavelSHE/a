
$( document ).ready( function () {

    $("#test_car").click(function(){
        var me = new Object();
        me.id = "00032";
        me.x = 0.23424123413241;
        me.y =1.54673230472;

        $.ajax({
            type: "POST",
            url: "/fms/services/1",
            data: me,
            //contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {
                add( 'Data: ' + JSON.stringify(data));
            },
            failure: function(errMsg) {
                add( 'Error: '+  errMsg);
            }
        });

        // $.ajax({
        //     type: "POST",
        //     url: "/fms/2",
        //     data: me,
        //     //contentType: "application/json; charset=utf-8",
        //     dataType: 'json',
        //     success: function (data) {
        //         add( 'Data: ' + JSON.stringify(data));
        //     },
        //     failure: function(errMsg) {
        //         add( 'Error: '+  errMsg);
        //     }
        // });
    });
} );

function add(String) {

    $('#result').append('<li>' + String + '</li>' );
    //text( String+ '<br/>' + $('#result').text()  );
}