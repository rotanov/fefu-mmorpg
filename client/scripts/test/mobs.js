define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData
var defaultDamage = "3d2"

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

        describe("Put Mob", function() {
            it("should fail put mob [badPlacing: map doesn't set]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
            })

            it("should fail put mob [badPlacing: put mob to wall]", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    ["#", "#", "#"],
                    ["#", "#", "#"],
                    ["#", "#", "#"]
                ]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put mob [mob's collision with walls]", function(done) {
                map = [
                        ["#", "#", "#"],
                        ["#", ".", "#"],
                        ["#", "#", "#"],
                    ]
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], ["CAN_MOVE"], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = mob.id
                        setTimeout(socket.singleExamine(mob.id, userData.sid), 3000)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(mob.x, data.x, "can't move by x")
                        assert.equal(mob.y, data.y, "can't move by y")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should successfully put mob", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
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
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(mob.x, (data.x).toFixed(1))
                        assert.equal(mob.y, (data.y).toFixed(1))
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should successfully put mobs with all possible races", function(done) {
                var counter = 0
                var races = [
                    "ORC", "EVIL", "TROLL", "GIANT", "DEMON",
                    "METAL", "DRAGON", "UNDEAD", "ANIMAL", "PLAYER"
                ]
                var map = [
                    [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        for (var i = 0, l = races.length; i < l; ++i) {
                            socket.putMob(0.5 + i, 0.5, {}, [], [], races[i], defaultDamage)
                        }
                        break
                    case "putMob":
                        ++counter
                        assert.equal("ok", data.result, "put mob " + counter)
                        if (counter == races.length) {
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put mob [badRace]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "BAD RACE", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("badRace", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put mob [badPlacing: out of map]", function(done) {
                var mob = {"x": 3.5, "y": 3.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put mob [badPlacing: coordinates are incorrect]", function(done) {
                var mob = {"x": ".", "y": "."}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should successfully put mobs in all cells", function(done) {
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                var counter = 0
                var cellsCount = map.length * map[0].length
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        for (var i = 0, l = map.length; i < l; ++i) {
                            for (var j = 0, l = map[i].length; j < l; ++j) {
                                socket.putMob(i + 0.5, j + 0.5, {}, [], [], "ORC", defaultDamage)
                            }
                        }
                        break
                    case "putMob":
                        ++counter
                        assert.equal("ok", data.result, "put mob " + counter)
                        if (counter == cellsCount) {
                            done()
                        }
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map})
            })

            it("should fail put mob [badDamage]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", "ddd")
                        break
                    case "putMob":
                        assert.equal("badDamage", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
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
    testMobs: testMobs
}

})