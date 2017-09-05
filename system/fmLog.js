var fmTime = require('./fmTime');
function fmLog(data) {
    //console.log(arguments.callee.caller.name);
    var info = "";
    try{
        info = info + arguments.callee.caller.name;
    }catch (e){
        info = info + "function";
    }
    try{
        info =  arguments.callee.caller.class + '.' + info;
    }catch (e){
        info = "class" + '.' + info;
    }
    fmTime(console.log, '('+ info + ') ' + data);
}

module.exports = fmLog;