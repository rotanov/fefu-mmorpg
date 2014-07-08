define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData
var dictionary

var playerVelocity
var slideThreshold
var ticksPerSecond
var screenRowCount
var screenColumnCount
var pickUpRadius

function testLocation() {
    utils.serverHandler({
        "action": "register",
        "login": "Location",
        "password": "Location"
    })

    userData = utils.serverHandler({
        "action": "login",
        "login": "Location",
        "password": "Location"
    })

    onopen = function() {
        socket.startTesting()
    }

    onmessage = function(e) {
        var data = JSON.parse(e.data);
        if (data.action == "startTesting" && data.result == "ok") {
          test()
        }
    }
    socket = ws.WSConnect(userData.webSocket, onopen, onmessage)
}

function getKey(map, value) {
    var flag = false
    var keyVal
    for (key in map) {
        if (map[key] != value) {
            continue
        }
        flag = true
        keyVal = key
        break
    }
    if (flag) {
        return keyVal
    } else {
        return false
    }
}

function test() {
    var assert = chai.assert

    describe("Location", function() {

        describe("Tick", function() {
            it("should successfully get tick", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.tick) {
                        done()
                   }
                })
            })
        })

        describe("getDictionary", function() {
            it("should return badSid", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    if (data.action == "getDictionary") {
                        assert.equal("badSid", data.result)
                        done()
                    }
                })
                socket.getDictionary("...")
            })

            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "getDictionary") {
                        assert.equal("ok", data.result)
                        assert.isDefined(data.dictionary)
                        var grass = getKey(data.dictionary, "grass")
                        var wall = getKey(data.dictionary, "wall")
                        assert.isTrue(grass != undefined)
                        assert.isTrue(wall != undefined)
                        dictionary = data.dictionary
                        done()
                    }
                })
                socket.getDictionary(userData.sid)
            })
        })

        describe("Upload map to server", function() {
            it("should return badMap", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "empty map")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": []})
            })

            it("should return badMap", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "bad symbol")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": [["/"]]})
            })

            it("should return badAction", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUploadMap") {
                        assert.equal("badAction", data.result, "must setUpMap")
                        done()
                    }
                })
                var map = [[getKey(dictionary, "grass")]]
                socket.setUpMap({"action": "setUploadMap", "map": map})
            })

            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("ok", data.result)
                        done()
                    }
                })
                var grass = getKey(dictionary, "grass")
                var map = [
                    [grass, grass, grass],
                    [grass, grass, grass],
                    [grass, grass, grass]
                ]
                socket.setUpMap({"action": "setUpMap", "map": map})
            })
        })

        describe("Set Up / Get Constants", function() {
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "getConst") {
                        assert.equal("ok", data.result)
                        assert.isDefined(data.playerVelocity)
                        assert.isDefined(data.slideThreshold)
                        assert.isDefined(data.ticksPerSecond)
                        assert.isDefined(data.screenRowCount)
                        assert.isDefined(data.screenColumnCount)
                        assert.isDefined(data.pickUpRadius)

                        playerVelocity = data.playerVelocity
                        slideThreshold = data.slideThreshold
                        ticksPerSecond = data.ticksPerSecond
                        screenRowCount = data.screenRowCount
                        screenColumnCount = data.screenColumnCount
                        pickUpRadius = data.pickUpRadius
                        done()
                    }
                })
                socket.getConst()
            })

            it("should return badAction", function(done) {
                var data = {
                    "action": "setUploadConst",
                    "playerVelocity": 1.0,
                    "slideThreshold": 0.1,
                    "ticksPerSecond": 60,
                    "screenRowCount": 7,
                    "screenColumnCount": 9,
                    "pickUpRadius": 1.5,
                }
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUploadConst") {
                        assert.equal("badAction", data.result, "must setUpConst")
                        done()
                    }
                })
                socket.setUpConst(data)
            })

            it("should return ok", function(done) {
                var data = {
                    "action": "setUpConst",
                    "playerVelocity": playerVelocity,
                    "slideThreshold": slideThreshold,
                    "ticksPerSecond": ticksPerSecond,
                    "screenRowCount": screenRowCount,
                    "screenColumnCount": screenColumnCount,
                    "pickUpRadius": pickUpRadius,
                }
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpConst") {
                        assert.equal("ok", data.result)
                        done()
                    }
                })
                socket.setUpConst(data)
            })
        })
    })

    after(function() {
        socket.setOnMessage(function(e) {
            var data = JSON.parse(e.data)
            if (data.action == "stopTesting") {
                if (data.result == "badAction") {
                    $("#msg").text("Invalid action.")
                    .css("color", "red")
                } else if (data.result == "ok") {
                    $("#msg").text("Test is successful.")
                    .css("color", "green")
                }
            }
        })
        socket.stopTesting()
        //socket.setOnMessage(undefined)
    })
    mocha.run()
}

return {
    testLocation: testLocation
}

})