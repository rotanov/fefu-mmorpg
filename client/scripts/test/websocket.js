define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var tick
var socket
var userData
var dictionary

var playerVelocity
var slideThreshold
var ticksPerSecond
var screenRowCount
var screenColumnCount
var pickUpRadius

function testWebSocket() {
    utils.serverHandler({
        "action": "register",
        "login": "WebSocket",
        "password": "WebSocket"
    })

    userData = utils.serverHandler({
        "action": "login",
        "login": "WebSocket",
        "password": "WebSocket"
    })

    onopen = function() {
        socket.startTesting(userData.sid)
    }

    onmessage = function(e) {
        var data = JSON.parse(e.data);
        if (data.action == "startTesting" && data.result == "ok") {
          test()
        }
    }
    socket = ws.WSConnect(userData.webSocket, onopen, onmessage)
}

function test() {
    var assert = chai.assert

    describe.only("WebSocket", function(done) {

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

        describe("Get Dictionary", function() {
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
            it("should return badMap [empty map]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": []})
            })

            it("should return badMap [symbol out of dictionary]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
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

            it("should return badMap [columns unequal rows]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
                        done()
                    }
                })
                var grass = getKey(dictionary, "grass")
                var map = [
                    [grass, grass, grass],
                    [grass, grass],
                    [grass]
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

        describe("Look", function() {
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "look") {
                        assert.equal("ok", data.result)
                        done()
                    }
                })
                socket.look(userData.sid)
            })

            it("should have properties [map, actors]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "look") {
                        assert.property(data, "map")
                        assert.property(data, "actors")
                        done()
                    }
                })
                socket.look(userData.sid)
            })

            it("coordinates must be defined", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "look") {
                        assert.isDefined(data.x)
                        assert.isDefined(data.y)
                        done()
                    }
                })
                socket.look(userData.sid)
            })

            it("should return badSid", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "look") {
                        assert.equal("badSid", data.result)
                        done()
                    }
                })
                socket.look(".")
            })
        })

        describe("Examine", function() {
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.equal("ok", data.result)
                        done()
                    }
                })
                socket.singleExamine(userData.id, userData.sid)
            })

            it("id must be defined", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.isDefined(data.id)
                        done()
                    }
                })
                socket.singleExamine(userData.id, userData.sid)
            })

            it("type must be player", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.equal("player", data.type)
                        done()
                    }
                })
                socket.singleExamine(userData.id, userData.sid)
            })

            it("login must be defined", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.isDefined(data.login)
                        done()
                    }
                })
                socket.singleExamine(userData.id, userData.sid)
            })

            it("coordinates must be defined", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.isDefined(data.x)
                        assert.isDefined(data.y)
                        done()
                    }
                })
                socket.singleExamine(userData.id, userData.sid)
            })

            it("should return badId", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.equal("badId", data.result)
                        done()
                    }
                })
                socket.singleExamine(".", userData.sid)
            })

            it("should return badSid", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.equal("badSid", data.result)
                        done()
                    }
                })
                socket.singleExamine(userData.id, ".")
            })
        })

        describe("Move", function() {
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "move") {
                        assert.equal("ok", data.result)
                        done()
                    }
                })
                socket.move("west", tick, userData.sid)
            })

            it("should return badSid", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "move") {
                        assert.equal("badSid", data.result)
                        done()
                    }
                })
                socket.move("west", tick, ".")
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
        socket.stopTesting(userData.sid)
        //socket.setOnMessage(undefined)
    })
    mocha.run()
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

return {
    testWebSocket: testWebSocket
}

})