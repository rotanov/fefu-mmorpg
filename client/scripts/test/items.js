define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData

var playerVelocity = 1.0
var slideThreshold = 0.1
var ticksPerSecond = 60
var pickUpRadius = 1.5
var screenRowCount = 7
var screenColumnCount = 7

var map = [
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", "."],
        ]
var item = {}
var player = {
    "x": 3.5,
    "y": 3.5
}
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

        before(function(done) {
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
                    done()
                    break
                }
            })
            socket.setUpConst(consts)
        })

        describe("Put Item", function() {
            it("should successfully put item", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(item.x, data.x, "correspondence between coordinates x")
                        assert.equal(item.y, data.y, "correspondence between coordinates x")
                        done()
                    }
                })
                socket.putItem(item.x, item.y, makeItem())
            })
        })

        describe("Pick Up", function() {
            it("should successfully pick up item [item's center is less constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(item.id, data.inventory[0], "item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail pick up item [item's center is more constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius + 1
                item.y = player.y + pickUpRadius + 1
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item abroad constant pickUpRadius")
                        item.id = data.id
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(undefined, data.inventory[0], "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully pick up item [item's center is equal constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius
                item.y = player.y + pickUpRadius
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item on border constant pickUpRadius")
                        item.id = data.id
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(item.id, data.inventory[0], "item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail pick up item [player already has it in inventory]", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(1, data.inventory.length, "one item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail pick up item [object doesn't exists]", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        item.id = -1
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "pick up")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(0, data.inventory.length, "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail pick up item [too heavy]", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                item.weight = 10000
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem(item.weight))
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "pickUp", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("tooHeavy", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(0, data.inventory.length, "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Destroy Item", function() {
            it("should successfully destroy item [item's center is less constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "destroyItem", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "destroy item")
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item [item's center is equal constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius
                item.y = player.y + pickUpRadius
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "destroyItem", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "destroy item")
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("badId", data.result, "examine request")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item [item's center is more constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius + 1
                item.y = player.y + pickUpRadius + 1
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "destroyItem", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "destroy item")
                        socket.singleExamine(item.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item from inventory", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "destroyItem", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "destroy item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(undefined, data.inventory[0], "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail destroy item [object doesn't exists]", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        item.id = -1
                        socket.enforce({"action": "destroyItem", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "destroy item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(undefined, data.inventory[0], "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Drop", function() {
            it("should successfully drop item from inventory", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "drop", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, "drop item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(undefined, data.inventory[0], "no item in inventory")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail drop item [player hasn't it in inventory]", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "drop", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "drop item")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail drop item [object doesn't exists]", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        item.id = -1
                        socket.enforce({"action": "drop", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, "drop item")
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Equip", function() {
            it("should successfully equip item from inventory", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(item.id, data.actionResult.slots["left-hand"], "item in slot")
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should successfully equip item [item's center is equal constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius
                item.y = player.y + pickUpRadius
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(item.id, data.actionResult.slots["left-hand"], "item in slot")
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully equip item [item's center is less constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + 0.5
                item.y = player.y + 0.5
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(item.id, data.actionResult.slots["left-hand"], "item in slot")
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully equip item [item's center is more constant pickUpRadius]", function(done) {
                item.id = null
                item.x = player.x + pickUpRadius + 1
                item.y = player.y + pickUpRadius + 1
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        socket.putItem(item.x, item.y, makeItem())
                        break
                    case "putItem":
                        assert.equal("ok", data.result, "put item")
                        item.id = data.id
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "no item in slot")
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Unequip", function() {
            it("should successfully unequip item", function(done) {
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item and slot")
                        player.id = data.id
                        player.sid = data.sid
                        socket.enforce({"action": "unequip", "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "unequip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "slot is empty")
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {"left-hand": makeItem()})
            })
        })

        describe("Equip / Unequip", function() {
            it("should successfully equip/unequip item", function(done) {
                var flag = true
                item.id = null
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})

                        } else if (data.actionResult.action == "examine") {
                            if (flag) {
                                flag = false
                                assert.equal(item.id, data.actionResult.slots["left-hand"], "equip item")
                                socket.enforce({"action": "unequip", "sid": player.sid, "slot": "left-hand"})

                            } else {
                                assert.equal(undefined, data.actionResult.slots["left-hand"], "unequip item")
                                done()
                            }
                        } else if (data.actionResult.action == "unequip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
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
            } else if (data.action == "logout") {
                assert.equal("ok", data.result)
            }
        })
        socket.stopTesting(userData.sid)
        socket.logout(userData.sid)
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