define(
function() {

    function consts() {
        var pack = {
           "action": "setUpConst",
           "playerVelocity": 1.0,
           "slideThreshold": 0.1,
           "ticksPerSecond": 60,
           "screenRowCount": 7,
           "screenColumnCount": 9,
        }
        return pack
    }

    return {
        consts: consts
    }

})