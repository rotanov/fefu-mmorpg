define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData

var consts = {
    "action": "setUpConst",
    "playerVelocity": 1.0,
    "slideThreshold": 0.1,
    "ticksPerSecond": 60,
    "screenRowCount": 1.5,
    "screenColumnCount": 3,
    "pickUpRadius": 3,
}

function testPlayers() {
    utils.serverHandler({
        "action": "register",
        "login": "testPlayers",
        "password": "testPlayers"
    })

    userData = utils.serverHandler({
        "action": "login",
        "login": "testPlayers",
        "password": "testPlayers"
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

    describe.only("Players", function(done) {

        before(function(done) {
            socket.setOnMessage(function(e) {
                var data = JSON.parse(e.data)
                if (data.action == "setUpConst") {
                    assert.equal("ok", data.result)
                    done()
                }
            })
            socket.setUpConst(consts)
        })

        describe("Put Player", function() {
            it("should fail put player [badPlacing: map doesn't set]", function(done) {//put player
                var player = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("badPlacing", data.result, "put player")
                        player.id = data.id
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
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
    testPlayers: testPlayers
}

})