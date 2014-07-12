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
            it("should fail put player [badPlacing: map doesn't set]", function(done) {
                var player = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("badPlacing", data.result, "put player")
                        player.id = data.id
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail put player [player's collision with walls]", function(done) {
                var player = {"x": 1.5, "y": 1.5}
                var tick = null
                var map = [
                        ["#", "#", "#"],
                        ["#", ".", "#"],
                        ["#", "#", "#"],
                    ]
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    tick = data.tick
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        player.sid = data.sid
                        socket.move("west", tick, player.sid)
                    case "move":
                        assert.equal("ok", data.result, "move")
                        socket.singleExamine(player.id, player.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(player.x, data.x, "can't move by x")
                        assert.equal(player.y, data.y, "can't move by y")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should successfully put player", function(done) {
                var player = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(player.x, (data.x).toFixed(1))
                        assert.equal(player.y, (data.y).toFixed(1))
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put player [put player on another player]", function(done) {
                var player = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var flag = true
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "put player")
                            socket.putPlayer(player.x, player.y, {}, [], {})
                        } else {
                            assert.equal("badPlacing", data.result, "put player")
                            player.id = data.id
                            socket.singleExamine(player.id, userData.sid)
                        }
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put player [badPlacing: out of map]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("badPlacing", data.result, "put player")
                        player.id = data.id
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put player [badPlacing: coordinates are incorrect]", function(done) {
                var player = {"x": ".", "y": "."}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("badPlacing", data.result, "put player")
                        player.id = data.id
                        setTimeout(socket.singleExamine(player.id, userData.sid), 500)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
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