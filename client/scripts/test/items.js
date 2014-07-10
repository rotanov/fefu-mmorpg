define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData

var playerVelocity = 1.0
var slideThreshold = 0.1
var ticksPerSecond = 60
var pickUpRadius = 1.5
var screenRowCount = 3
var screenColumnCount = 3

var map = []
var item_id = null
var player = {"x": 1.5, "y": 1.5}
var consts = {
    "action": "setUpConst",
    "playerVelocity": playerVelocity,
    "slideThreshold": slideThreshold,
    "ticksPerSecond": ticksPerSecond,
    "screenRowCount": screenRowCount,
    "screenColumnCount": screenColumnCount,
    "pickUpRadius": pickUpRadius,
}

function testItems() {
    utils.serverHandler({
        "action": "register",
        "login": "testItems",
        "password": "testItems"
    })

    userData = utils.serverHandler({
        "action": "login",
        "login": "testItems",
        "password": "testItems"
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

    describe.only("Items", function(done) {

        describe("Pick Up", function() {
            it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        socket.putItem(player.x+0.5, player.y+0.5, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result)
                        item_id = data.id
                        socket.enforce({"action": "pickUp", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            it("should return badId", function(done) {
                item_id = null
                map = [
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        socket.putItem(player.x+pickUpRadius+1, player.y+pickUpRadius+1, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result)
                        item_id = data.id
                        socket.enforce({"action": "pickUp", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "too far")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            it("should return badId", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = data.inventory[0]
                        socket.enforce({"action": "pickUp", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "player already has it in inventory")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            it("should return badId", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = 0123456789
                        socket.enforce({"action": "pickUp", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "object doesn't exists")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            /*it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        socket.putItem(player.x+0.5, player.y+0.5, makeItem(10000))
                        break
                    case "putItem":
                        assert.equal("ok", data.result)
                        item_id = data.id
                        socket.enforce({"action": "pickUp", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("tooHeavy", data.actionResult.result)
                        done()
                    }
                })
                socket.setUpConst(consts)
            })*/
        })

        describe("Destroy Item", function() {
            it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = data.inventory[0]
                        socket.enforce({"action": "destroyItem", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

           it("should return badId", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = 12345
                        socket.enforce({"action": "destroyItem", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "object doesn't exists")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })
        })

        describe("Drop", function() {
            it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = data.inventory[0]
                        socket.enforce({"action": "drop", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            it("should return badId", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        socket.putItem(player.x+0.5, player.y+0.5, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result)
                        item_id = data.id
                        socket.enforce({"action": "drop", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "player hasn't it in inventory")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })

            it("should return badId", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.sid = data.sid
                        item_id = 0123456789
                        socket.enforce({"action": "drop", "id": item_id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("badId", data.actionResult.result, "object doesn't exists")
                        done()
                    }
                })
                socket.setUpConst(consts)
            })
        })

        describe("Equip", function() {
            it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.id = data.id
                        player.sid = data.sid
                        item_id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item_id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(item_id, data.actionResult.slots["left-hand"])
                            done()
                        }
                       
                    }
                })
                socket.setUpConst(consts)
            })
        })

        describe("Unequip", function() {
            it("should return ok", function(done) {
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {"left-hand": makeItem()})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.id = data.id
                        player.sid = data.sid
                        socket.enforce({"action": "unequip", "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        if (data.actionResult.action == "unequip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "should be slot")
                        }
                        done()
                    }
                })
                socket.setUpConst(consts)
            })
        })

        describe("Equip / Unequip", function() {
            it("should return ok", function(done) {
                var flag = true
                item_id = null
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
                        socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
                        break
                    case "putPlayer":
                        assert.equal("ok", data.result)
                        player.id = data.id
                        player.sid = data.sid
                        item_id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item_id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result)
                        assert.equal("ok", data.actionResult.result)
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})

                        } else if (data.actionResult.action == "examine") {
                            if (flag) {
                                flag = false
                                assert.equal(item_id, data.actionResult.slots["left-hand"])
                                socket.enforce({"action": "unequip", "sid": player.sid, "slot": "left-hand"})

                            } else {
                                assert.equal(undefined, data.actionResult.slots["left-hand"])
                                done()
                            }
                        } else if (data.actionResult.action == "unequip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        }
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

function makeItem(weight, class_, type, bonuses, effects, subtype) {
    weight   = weight  || 1
    class_   = class_  || "garment"
    type     = type    || "shield"
    bonuses  = bonuses || []
    effects  = effects || []
    var item = {
        "weight": weight,
        "class": class_,
        "type": type,
        "bonuses": bonuses,
        "effects": effects
    }
    if (subtype) {
        item.subtype = subtype
    }
    return item
}

return {
    testItems: testItems
}

})