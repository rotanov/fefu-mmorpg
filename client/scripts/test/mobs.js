define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData
var defaultDamage = "3d2"
var consts = {}

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

    consts = {
        "action": "setUpConst",
        "playerVelocity": 1.0,
        "slideThreshold": 0.1,
        "ticksPerSecond": 60,
        "screenRowCount": 1.5,
        "screenColumnCount": 3,
        "pickUpRadius": 3,
        "sid": userData.sid
    }

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

        /*describe("Put Mob", function() {
            beforeEach(runBeforeEach)

            it("should fail put mob [badSid]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "putMob":
                        assert.equal("badSid", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, -1)
            })

            it("should fail put mob [badPlacing: map doesn't set]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
            })

            it("should fail put mob [badPlacing: put mob to wall]", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    ["#", "#", "#"],
                    ["#", "#", "#"],
                    ["#", "#", "#"]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [mob's collision with walls]", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                        ["#", "#", "#"],
                        ["#", ".", "#"],
                        ["#", "#", "#"],
                    ]
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], ["CAN_MOVE"], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = data.id
                        setTimeout(socket.singleExamine(mob.id, userData.sid), 500)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(mob.x, data.x, "can't move by x")
                        assert.equal(mob.y, data.y, "can't move by y")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should successfully put mob", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [put mob on another mob]", function(done) {
                var flag = true
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "put mob1")
                            socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        } else {
                            assert.equal("badPlacing", data.result, "put mob2")
                            mob.id = data.id
                            socket.singleExamine(mob.id, userData.sid)
                        }
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [cross mobs]", function(done) {
                var flag = true
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "put mob1")
                            socket.putMob(mob.x+0.5, mob.y+0.5, {}, [], [], "ORC", defaultDamage, userData.sid)
                        } else {
                            assert.equal("badPlacing", data.result, "put mob2")
                            mob.id = data.id
                            socket.singleExamine(mob.id, userData.sid)
                        }
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should successfully put mob [narrow corridor]", function(done) {
                var flag = true
                var mob = {"x": 1.5, "y": 0.5}
                var map = [["#", ".", ".", "#"]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "put mob1")
                            socket.putMob(mob.x+1, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob.id = data.id
                            socket.singleExamine(mob.id, userData.sid)
                        }
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
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
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        for (var i = 0, l = races.length; i < l; ++i) {
                            socket.putMob(0.5 + i, 0.5, {}, [], [], races[i], defaultDamage, userData.sid)
                        }
                        break
                    case "putMob":
                        ++counter
                        assert.equal("ok", data.result, "put mob " + counter)
                        if (counter == races.length) {
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badRace]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "BAD RACE", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badRace", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badPlacing: out of map]", function(done) {
                var mob = {"x": 3.5, "y": 3.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badPlacing: coordinates are incorrect]", function(done) {
                var mob = {"x": ".", "y": "."}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badPlacing", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
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
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        for (var i = 0, l = map.length; i < l; ++i) {
                            for (var j = 0, l = map[i].length; j < l; ++j) {
                                socket.putMob(i + 0.5, j + 0.5, {}, [], [], "ORC", defaultDamage, userData.sid)
                            }
                        }
                        break
                    case "putMob":
                        ++counter
                        assert.equal("ok", data.result, "put mob " + counter)
                        if (counter == cellsCount) {
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badDamage]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", "ddd", userData.sid)
                        break
                    case "putMob":
                        assert.equal("badDamage", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badDamage]", function(done) {
                var mob = {"x": 0.5, "y": 0.5}
                var map = [["."]]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], [], "ORC", "2g3", userData.sid)
                        break
                    case "putMob":
                        assert.equal("badDamage", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should put two mobs with different ids", function(done) {
                var flag = true
                var mob1 = {"x": 1.5, "y": 1.5}
                var mob2 = {"x": 0.4, "y": 0.4}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob1.x, mob1.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "put mob1")
                            mob1.id = data.id
                            socket.putMob(mob2.x, mob2.y, {}, [], [], "ORC", defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob2.id = data.id
                            assert.notEqual(mob1.id, mob2.id, "different ids")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should successfully walk around", function(done) {
                var mob = {"x": 2.5, "y": 2.5}
                map = [
                        ["#", "#", "#", "#", "#"],
                        ["#", ".", ".", ".", "#"],
                        ["#", ".", ".", ".", "#"],
                        ["#", ".", ".", ".", "#"],
                        ["#", "#", "#", "#", "#"]
                    ]
                this.timeout(8000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], ["CAN_MOVE"], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = data.id
                        $.when(setTimeout(function(){}, 6000))
                        .done(function(data) {socket.singleExamine(mob.id, userData.sid)})
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(true, (mob.x != data.x || mob.y != data.y), "diff coordinate")
                        socket.setOnMessage(undefined)
                        done()
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("should fail put mob [badFlag]", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [], ["BAD_FLAG"], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badFlag", data.result, "put mob")
                        mob.id = data.id
                        socket.singleExamine(mob.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            /*it("should fail put mob [badInventory]", function(done) {
                var mob = {"x": 1.5, "y": 1.5}
                var map = [
                    [".", ".", "."],
                    [".", ".", "."],
                    [".", ".", "."]
                ]
                socket.setOnMessage(function(e) {
                    console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {}, [{
                            "weight": "BAD_WEIGHT",
                            "class": "BAD_CLASS",
                            "type": "BAD_TYPE",
                            "bonuses": "BAD_BONUSES",
                            "effects": "BAD_EFFECTS"
                        }], [], "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("badInventory", data.result, "put mob")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })*/
        //})

        describe("Attack Mob", function() {
            beforeEach(runBeforeEach)

            it("mob should fail attack itself", function(done) {
                var mob = {"x": 0.5, "y": 0.5, "HP": 50, "MAX_HP": 100}
                var map = [["."]]
                this.timeout(4000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y, {"HP": mob.HP, "MAX_HP": mob.MAX_HP},
                                      [/*inventory*/], ["HATE_ORC", "CAN_BLOW"],
                                      "ORC", defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = data.id
                        setTimeout(function() {socket.singleExamine(mob.id, userData.sid)}, 2000)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(mob.HP, data.health, "health hasn't changed")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("mob1 should attack mob2 [mob2 hasn't CAN_BLOW & HATE_ORC]", function(done) {
                var mobFlag = true
                var examineFlag = true
                var mob1 = {"x": 0.5, "y": 0.5,
                            "race": "ORC",
                            "stats": {"HP": 200, "MAX_HP": 200},
                            "flags": ["HATE_TROLL", "CAN_BLOW"],
                            "inventory": []
                }
                var mob2 = {"x": 1.7, "y": 0.5,
                            "race": "TROLL",
                            "stats": {"HP": 100, "MAX_HP": 100},
                            "flags": [],
                            "inventory": []
                }
                var map = [[".", ".", "."]]
                this.timeout(6000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob1.x, mob1.y,
                                      mob1.stats, mob1.inventory, mob1.flags,
                                      mob1.race, defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (mobFlag) {
                            mobFlag = false
                            assert.equal("ok", data.result, "put mob1")
                            mob1.id = data.id
                            socket.putMob(mob2.x, mob2.y,
                                          mob2.stats, mob2.inventory, mob2.flags,
                                          mob2.race, defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob2.id = data.id
                            setTimeout(function() {socket.singleExamine(mob1.id, userData.sid)}, 3000)
                            setTimeout(function() {socket.singleExamine(mob2.id, userData.sid)}, 3000)
                        }
                        break
                    case "examine":
                        if (examineFlag) {
                            examineFlag = false
                            assert.equal("ok", data.result, "mob1: examine request")
                            assert.equal(mob1.stats.HP, data.health, "mob1: health hasn't changed")
                        } else {
                            assert.equal("ok", data.result, "mob2: examine request")
                            assert.notEqual(mob2.stats.HP, data.health, "mob2: health has changed")
                            assert.isTrue(mob2.stats.HP > data.health, "mob2: health has decreased")
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("mob1 should attack mob2 [mob1 and mob2 has CAN_BLOW]", function(done) {
                var mobFlag = true
                var examineFlag = true
                var mob1 = {"x": 0.5, "y": 0.5,
                            "race": "ORC",
                            "stats": {"HP": 200, "MAX_HP": 200},
                            "flags": ["HATE_TROLL", "CAN_BLOW"],
                            "inventory": []
                }
                var mob2 = {"x": 1.7, "y": 0.5,
                            "race": "TROLL",
                            "stats": {"HP": 100, "MAX_HP": 100},
                            "flags": ["HATE_ORC", "CAN_BLOW"],
                            "inventory": []
                }
                var map = [[".", ".", "."]]
                this.timeout(6000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob1.x, mob1.y,
                                      mob1.stats, mob1.inventory, mob1.flags,
                                      mob1.race, defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (mobFlag) {
                            mobFlag = false
                            assert.equal("ok", data.result, "put mob1")
                            mob1.id = data.id
                            socket.putMob(mob2.x, mob2.y,
                                          mob2.stats, mob2.inventory, mob2.flags,
                                          mob2.race, defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob2.id = data.id
                            setTimeout(function() {socket.singleExamine(mob1.id, userData.sid)}, 3000)
                            setTimeout(function() {socket.singleExamine(mob2.id, userData.sid)}, 3000)
                        }
                        break
                    case "examine":
                        if (examineFlag) {
                            examineFlag = false
                            assert.equal("ok", data.result, "mob1: examine request")
                            assert.notEqual(mob1.stats.HP, data.health, "mob1: health has changed")
                            assert.isTrue(mob1.stats.HP > data.health, "mob1: health has decreased")
                        } else {
                            assert.equal("ok", data.result, "mob2: examine request")
                            assert.notEqual(mob2.stats.HP, data.health, "mob2: health has changed")
                            assert.isTrue(mob2.stats.HP > data.health, "mob2: health has decreased")
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("mob1 shouldn't attack mob2 [mob1 and mob2 hasn't CAN_BLOW]", function(done) {
                var mobFlag = true
                var examineFlag = true
                var mob1 = {"x": 0.5, "y": 0.5,
                            "race": "ORC",
                            "stats": {"HP": 200, "MAX_HP": 200},
                            "flags": ["HATE_TROLL"],
                            "inventory": []
                }
                var mob2 = {"x": 1.7, "y": 0.5,
                            "race": "TROLL",
                            "stats": {"HP": 100, "MAX_HP": 100},
                            "flags": ["HATE_ORC"],
                            "inventory": []
                }
                var map = [[".", ".", "."]]
                this.timeout(6000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob1.x, mob1.y,
                                      mob1.stats, mob1.inventory, mob1.flags,
                                      mob1.race, defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (mobFlag) {
                            mobFlag = false
                            assert.equal("ok", data.result, "put mob1")
                            mob1.id = data.id
                            socket.putMob(mob2.x, mob2.y,
                                          mob2.stats, mob2.inventory, mob2.flags,
                                          mob2.race, defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob2.id = data.id
                            setTimeout(function() {socket.singleExamine(mob1.id, userData.sid)}, 3000)
                            setTimeout(function() {socket.singleExamine(mob2.id, userData.sid)}, 3000)
                        }
                        break
                    case "examine":
                        if (examineFlag) {
                            examineFlag = false
                            assert.equal("ok", data.result, "mob1: examine request")
                            assert.equal(mob1.stats.HP, data.health, "mob1: health hasn't changed")
                        } else {
                            assert.equal("ok", data.result, "mob2: examine request")
                            assert.equal(mob2.stats.HP, data.health, "mob2: health hasn't changed")
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("mob1 shouldn't attack mob2 [mobs are too far apart]", function(done) {
                var mobFlag = true
                var examineFlag = true
                var mob1 = {"x": 0.5, "y": 0.5,
                            "race": "ORC",
                            "stats": {"HP": 200, "MAX_HP": 200},
                            "flags": ["HATE_TROLL", "CAN_BLOW"],
                            "inventory": []
                }
                var mob2 = {"x": 7.7, "y": 0.5,
                            "race": "TROLL",
                            "stats": {"HP": 100, "MAX_HP": 100},
                            "flags": ["HATE_ORC", "CAN_BLOW"],
                            "inventory": []
                }
                var map = [[".", ".", ".", ".", ".", ".", ".", "."]]
                this.timeout(6000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob1.x, mob1.y,
                                      mob1.stats, mob1.inventory, mob1.flags,
                                      mob1.race, defaultDamage, userData.sid)
                        break
                    case "putMob":
                        if (mobFlag) {
                            mobFlag = false
                            assert.equal("ok", data.result, "put mob1")
                            mob1.id = data.id
                            socket.putMob(mob2.x, mob2.y,
                                          mob2.stats, mob2.inventory, mob2.flags,
                                          mob2.race, defaultDamage, userData.sid)
                        } else {
                            assert.equal("ok", data.result, "put mob2")
                            mob2.id = data.id
                            setTimeout(function() {socket.singleExamine(mob1.id, userData.sid)}, 3000)
                            setTimeout(function() {socket.singleExamine(mob2.id, userData.sid)}, 3000)
                        }
                        break
                    case "examine":
                        if (examineFlag) {
                            examineFlag = false
                            assert.equal("ok", data.result, "mob1: examine request")
                            assert.equal(mob1.stats.HP, data.health, "mob1: health hasn't changed")
                        } else {
                            assert.equal("ok", data.result, "mob2: examine request")
                            assert.equal(mob2.stats.HP, data.health, "mob2: health hasn't changed")
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
            })

            it("mob shouldn't attack player \
                [mob hasn't CAN_BLOW & HATE_PLAYER]", function(done) {
                var flag = true
                var mob = {"x": 1.5, "y": 0.5,
                           "race": "TROLL",
                           "stats": {"HP": 100, "MAX_HP": 100},
                           "flags": [],
                           "inventory": []
                }
                var player = {"x": mob.x+1, "y": mob.y,
                              "stats": {"HP": 100, "MAX_HP": 100},
                              "slots": [],
                              "inventory": []
                }
                var map = [["#", ".", ".", "#"]]
                this.timeout(6000)
                socket.setOnMessage(function(e) {
                    //console.log(JSON.parse(e.data))
                    var data = JSON.parse(e.data)
                    switch (data.action) {
                    case "setUpMap":
                        assert.equal("ok", data.result, "load map")
                        socket.putMob(mob.x, mob.y,
                                      mob.stats, mob.inventory, mob.flags,
                                      mob.race, defaultDamage, userData.sid)
                        break
                    case "putMob":
                        assert.equal("ok", data.result, "put mob")
                        mob.id = data.id
                        socket.putPlayer(player.x, player.y,
                                         player.stats, player.inventory,
                                         player.slots, userData.sid)
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        player.sid = data.sid
                        setTimeout(function() {socket.singleExamine(player.id, player.sid)}, 3000)
                        setTimeout(function() {socket.singleExamine(mob.id, userData.sid)}, 3000)
                    case "examine":
                        if (flag) {
                            flag = false
                            assert.equal("ok", data.result, "player: examine request")
                            assert.equal(player.stats.HP, data.health, "player: health hasn't changed")
                        } else {
                            assert.equal("ok", data.result, "mob: examine request")
                            assert.equal(mob.stats.HP, data.health, "mob: health hasn't changed")
                            socket.setOnMessage(undefined)
                            done()
                        }
                        break
                    }
                })
                socket.setUpMap({"action": "setUpMap", "map": map, "sid": userData.sid})
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