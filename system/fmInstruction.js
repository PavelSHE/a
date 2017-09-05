var protocol = require('./protocol.json');

var instructionBaseID = 1000;

function fmInstruction(name) {
    var instruction;
    try {
        instruction =  JSON.parse(JSON.stringify((protocol[name]).message));
    }catch (e){
        console.log(e);
        return;
    }
    instruction.id = instructionBaseID++;

    return instruction;
};

module.exports = fmInstruction;