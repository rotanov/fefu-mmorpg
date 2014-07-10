define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData
var defaultDamage = 10

var map = []
var mob = {"x": 1.5, "y": 1.5}
var consts = {
    "action": "setUpConst",
    "playerVelocity": 1.0,
    "slideThreshold": 0.1,
    "ticksPerSecond": 60,
    "screenRowCount": 1.5,
    "screenColumnCount": 3,
    "pickUpRadius": 3,
}

function testMobs() {
    utils.serverHandler({
        "action": "register",
        "login": "testMobs",
        "password": "testMobs"
    })

    userData = utils.serverHandler({
        "action": "login",
        "login": "testMobs",
        "password": "testMobs"
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

    describe.only("Mobs", function(done) {

        describe("Put Mob", function() {
            it("should return ok", function(done) {
                map = [
                            [".", ".", "."],
                            [".", ".", "."],
                            [".", ".", "."]
                        ]
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpConst":
                        assert.equal("ok", data.result)
                        socket.setUpMap({
                            "action": "setUpMap",
                            "map": map
                        })
                        break
                    case "setUpMap":
                        assert.equal("ok", data.result)
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("ok", data.result)
                        mob.id = mob.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result)
                        assert.equal(mob.x, data.x)
                        assert.equal(mob.y, data.y)
                        done()
                        break
                    }
                })
                socket.setUpConst(consts)
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

return {
    testMobs: testMobs
}

})