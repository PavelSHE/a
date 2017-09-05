//globals
var map;
var currentSource;
var currentDestination;
var servicesDrawings = [];
var simLocations =["Tel Aviv-Yafo, Israel","Jerusalem, Israel","Haifa, Israel",
    "Be'er Sheva, Israel","Ashdod, Israel","Tiberias, Israel","Sderot, Israel",
    "Afula, Israel","Shlomi, Israel","Sde Boker, Israel",
    "Arad, Israel","Eilat, Israel","Qiryat Shemona, Israel","Karmiel, Israel"];

//var global_service = "http://localhost:3000/fms/";
var global_service = "/fms/";
var simulationTick = 1000;//miliseconds
var simulationTickDefault = 1000;
var simCalculationPrecision = 6;
var simulationRunning = false;
//var simulationDefaultSpeed = 50;


var randomizationRunning = false;
var randomizationTick = 300000;//2000;//
var randomizationMax = 30;
var randomizationMin = 10;
var randomizationLeft = 0;

