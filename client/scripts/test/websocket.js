define(["jquery", "lib/chai", "utils/utils", "utils/socket", "test/items"],
function($, chai, utils, ws, items_) {

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

function runBeforeEach(done) {
    console.log("running afterEach function...")
    setTimeout(done, 1000)
}

function test() {
    var assert = chai.assert

    describe.only("WebSocket", function(done) {

        describe("Tick", function() {
            beforeEach(runBeforeEach)
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
            beforeEach(runBeforeEach)
            it("should return badSid", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    if (data.action == "getDictionary") {
                        assert.equal("badSid", data.result, "get dictionary")
                        done()
                    }
                })
                socket.getDictionary("...")
            })

            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "getDictionary") {
                        assert.equal("ok", data.result, "get dictionary")
                        assert.isDefined(data.dictionary)
                        var grass = getKey(data.dictionary, "grass")
                        var wall = getKey(data.dictionary, "wall")
                        assert.isTrue(grass != undefined)
                        assert.isTrue(wall != undefined)
                        dictionary = data.dictionary
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.getDictionary(userData.sid)
            })
        })

        describe("Put Item", function() {
            beforeEach(runBeforeEach)
            it("should fail put item [badPlacing: map doesn't set]", function(done) {
                var item = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putItem":
                        assert.equal("badPlacing", data.result, "put item")
                        item.id = data.id
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putItem(item.x, item.y, items_.makeItem(), userData.sid)
            })

            it("should fail put item [badPlacing: coordinates are incorrect]", function(done) {
                var item = {"x": ".", "y": "."}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putItem":
                        assert.equal("badPlacing", data.result, "put item")
                        item.id = data.id
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putItem(item.x, item.y, items_.makeItem(), userData.sid)
            })
        })

        describe("Upload map to server", function() {
            beforeEach(runBeforeEach)
            it("should fail load map [badSid]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badSid", data.result, "load map")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": [], "sid": -1})
            })

            it("should return badMap [empty map]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": [], "sid": userData.sid})
            })

            it("should return badMap [symbol out of dictionary]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": [["/"]], "sid": userData.sid})
            })

            it("should return badAction", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUploadMap") {
                        assert.equal("badAction", data.result, "must setUpMap")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                var map = [[getKey(dictionary, "grass")]]
                socket.setUpMap({"action": "setUploadMap", "map": map, "sid": userData.sid})
            })

            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("ok", data.result)
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                var grass = getKey(dictionary, "grass")
                var map = [
                    [grass, grass, grass],
                    [grass, grass, grass],
                    [grass, grass, grass]
                ]
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should return badMap [columns unequal rows]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpMap") {
                        assert.equal("badMap", data.result, "load map")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                var grass = getKey(dictionary, "grass")
                var map = [
                    [grass, grass, grass],
                    [grass, grass],
                    [grass]
                ]
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })
        })

        describe("Set Up / Get Constants", function() {
            beforeEach(runBeforeEach)
            it("should fail get constants [badSid]", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "getConst") {
                        assert.equal("badSid", data.result, "get constants")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.getConst(-1)
            })

            it("should successfully get constants", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "getConst") {
                        assert.equal("ok", data.result, "get constants")
                        assert.isDefined(data.playerVelocity, "playerVelocity")
                        assert.isDefined(data.slideThreshold, "slideThreshold")
                        assert.isDefined(data.ticksPerSecond, "ticksPerSecond")
                        assert.isDefined(data.screenRowCount, "screenRowCount")
                        assert.isDefined(data.screenColumnCount, "screenColumnCount")
                        assert.isDefined(data.pickUpRadius, "pickUpRadius")

                        playerVelocity = data.playerVelocity
                        slideThreshold = data.slideThreshold
                        ticksPerSecond = data.ticksPerSecond
                        screenRowCount = data.screenRowCount
                        screenColumnCount = data.screenColumnCount
                        pickUpRadius = data.pickUpRadius
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.getConst(userData.sid)
            })

            it("should fail set up constants [badAction]", function(done) {
                var data = {
                    "action": "setUploadConst",
                    "playerVelocity": 1.0,
                    "slideThreshold": 0.1,
                    "ticksPerSecond": 60,
                    "screenRowCount": 7,
                    "screenColumnCount": 9,
                    "pickUpRadius": 1.5,
                    "sid": userData.sid
                }
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUploadConst") {
                        assert.equal("badAction", data.result, "must setUpConst")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpConst(data)
            })

            it("should successfully set up constants", function(done) {
                var data = {
                    "action": "setUpConst",
                    "playerVelocity": playerVelocity,
                    "slideThreshold": slideThreshold,
                    "ticksPerSecond": ticksPerSecond,
                    "screenRowCount": screenRowCount,
                    "screenColumnCount": screenColumnCount,
                    "pickUpRadius": pickUpRadius,
                    "sid": userData.sid
                }
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpConst") {
                        assert.equal("ok", data.result, "set up constants")
                        socket.getConst(userData.sid)
                    } else if (data.action == "getConst") {
                        assert.equal(playerVelocity, data.playerVelocity, "playerVelocity")
                        assert.equal(slideThreshold, data.slideThreshold, "slideThreshold")
                        assert.equal(ticksPerSecond, data.ticksPerSecond, "ticksPerSecond")
                        assert.equal(screenRowCount, data.screenRowCount, "screenRowCount")
                        assert.equal(screenColumnCount, data.screenColumnCount, "screenColumnCount")
                        assert.equal(pickUpRadius, data.pickUpRadius, "pickUpRadius")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpConst(data)
            })

            it("should fail set up constants [constants are not numbers]", function(done) {
                var data = {
                    "action": "setUploadConst",
                    "playerVelocity": "a",
                    "slideThreshold": "b",
                    "ticksPerSecond": "c",
                    "screenRowCount": "d",
                    "screenColumnCount": "e",
                    "pickUpRadius": "f",
                    "sid": userData.sid
                }
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data);
                    if (data.action == "setUpConst") {
                        assert.equal("badAction", data.result)
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpConst(data)
            })

        })

        describe("Look", function() {
            beforeEach(runBeforeEach)
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "look") {
                        assert.equal("ok", data.result)
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.look(".")
            })
        })

        describe("Examine", function() {
            beforeEach(runBeforeEach)
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "examine") {
                        assert.equal("ok", data.result)
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.singleExamine(userData.id, ".")
            })
        })

        describe("Move", function() {
            beforeEach(runBeforeEach)
            it("should return ok", function(done) {
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    if (data.action == "move") {
                        assert.equal("ok", data.result)
                        socket.setOnMessage(undefined)
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
                        socket.setOnMessage(undefined)
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