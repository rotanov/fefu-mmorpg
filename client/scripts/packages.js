define(
function() {

    function consts() {
        var packege = {
           "action": "setUpConst",
           "playerVelocity": 1.0,
           "slideThreshold": 0.1,
           "ticksPerSecond": 60,
           "screenRowCount": 7,
           "screenColumnCount": 9,
        }
        return packege
    }

    return {
        consts: consts
    }

})