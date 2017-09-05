function fmTime(next ,data) {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var result = year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    if(next && data){
        next(result + ": " + data);
    }
    else if(next){
        next(result);
    }
    else{
        return result;
    }
}
module.exports = fmTime;