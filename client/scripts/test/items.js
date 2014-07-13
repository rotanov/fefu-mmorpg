define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var socket
var userData
var assert = chai.assert

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

function BF(done) {
    socket.setOnMessage(function(e) {
        var data = JSON.parse(e.data)
        switch(data.action) {
        case "setUpConst":
            assert.equal("ok", data.result, "set up constans")
            socket.setUpMap({"action": "setUpMap", "map": map})
            break
        case "setUpMap":
            assert.equal("ok", data.result, "load map")
            socket.setOnMessage(undefined)
            setTimeout(done, 1000)
        }
    })
    socket.setUpConst(consts)
}

function test() {

    describe.only("Items", function(done) {

        describe("Put Item", function() {
            beforeEach(BF)
            it("should successfully put item", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putItem(item.x, item.y, makeItem())
            })
        })

        describe("Pick Up", function() {
            beforeEach(BF)
            it("should successfully pick up item [item's center is less constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail pick up item [item's center is more constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius + 1, "y": player.y + pickUpRadius + 1}
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
                        assert.equal("badId", data.actionResult.result, "pick up item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(undefined, data.inventory[0], "no item in inventory")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully pick up item [item's center is equal constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius, "y": player.y + pickUpRadius}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail pick up item [player already has it in inventory]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail pick up item [object doesn't exists]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            /*it("should fail pick up item [too heavy]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5, "weight": 10000}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })*/

            it("should fail pick up item [object in other player's inventory]", function(done) {
                var flag = true
                var player1 = {"x": 3.5, "y": 3.5}
                var player2 = {"x": 1.5, "y": 1.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        if (flag) {
                            player1.id = data.id
                            player1.sid = data.sid
                            item.id = data.inventory[0]
                            flag = false
                        } else {
                            player2.sid = data.sid
                            socket.enforce({"action": "pickUp", "id": item.id, "sid": player2.sid})
                        }
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "pickUp") {
                            assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player1.id, "sid": player1.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(item.id, data.actionResult.inventory[0], "item in player's invetory")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player1.x, player1.y, {}, [makeItem()], {})
                socket.putPlayer(player2.x, player2.y, {}, [], {})
            })
        })

        describe("Destroy Item", function() {
            beforeEach(BF)
            it("should successfully destroy item [item's center is less constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item [item's center is equal constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius, "y": player.y + pickUpRadius}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item [item's center is more constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius + 1, "y": player.y + pickUpRadius + 1}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully destroy item from inventory", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail destroy item [object doesn't exists]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail destroy item [object in other player's inventory]", function(done) {
                var flag = true
                var player1 = {"x": 3.5, "y": 3.5}
                var player2 = {"x": 1.5, "y": 1.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        if (flag) {
                            player1.id = data.id
                            player1.sid = data.sid
                            item.id = data.inventory[0]
                            flag = false
                        } else {
                            player2.sid = data.sid
                            socket.enforce({"action": "destroyItem", "id": item.id, "sid": player2.sid})
                        }
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "destroyItem") {
                            assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player1.id, "sid": player1.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(item.id, data.actionResult.inventory[0], "item in player's invetory")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player1.x, player1.y, {}, [makeItem()], {})
                socket.putPlayer(player2.x, player2.y, {}, [], {})
            })
        })

        describe("Drop", function() {
            beforeEach(BF)
            it("should successfully drop item from inventory", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        player.id = data.id
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail drop item [invalid sid]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.sid = data.sid
                        player.id = data.id
                        item.id = data.inventory[0]
                        socket.enforce({"action": "drop", "id": item.id, "sid": -1})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badSid", data.actionResult.result, "drop item")
                        socket.singleExamine(player.id, userData.sid)
                        break
                    case "examine":
                        assert.equal("ok", data.result, "examine request")
                        assert.equal(item.id, data.inventory[0], "item in inventory")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail drop item [player hasn't it in inventory]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail drop item [object doesn't exists]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
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
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail drop item [object in other player's inventory]", function(done) {
                var flag = true
                var player1 = {"x": 3.5, "y": 3.5}
                var player2 = {"x": 1.5, "y": 1.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        if (flag) {
                            player1.id = data.id
                            player1.sid = data.sid
                            item.id = data.inventory[0]
                            flag = false
                        } else {
                            player2.sid = data.sid
                            socket.enforce({"action": "drop", "id": item.id, "sid": player2.sid})
                        }
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "drop") {
                            assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player1.id, "sid": player1.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(item.id, data.actionResult.inventory[0], "item in player's invetory")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player1.x, player1.y, {}, [makeItem()], {})
                socket.putPlayer(player2.x, player2.y, {}, [], {})
            })
        })

        describe("Equip", function() {
            beforeEach(BF)
            it("should successfully equip item from inventory", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
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
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail equip item [slot doesn't exist in request]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badSlot", data.actionResult.result, data.actionResult.action + " request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail equip item from inventory [invalid slot specificator]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "ear"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "equip") {
                            assert.equal("badSlot", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["ear"], "no such slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail equip item [invalid sid]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": -1, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "equip") {
                            assert.equal("badSid", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "no item in slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            it("should fail equip item [object doesn't exists]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = -1
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                       
                        if (data.actionResult.action == "equip") {
                            assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "no item in slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail equip item [object doesn't match slot]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player with item")
                        player.id = data.id
                        player.sid = data.sid
                        item.id = data.inventory[0]
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "feet"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "equip") {
                            assert.equal("badSlot", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        }  if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["feet"], "no item in slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {})
            })

            /*it("should successfully equip item [item's center is equal constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius, "y": player.y + pickUpRadius}
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
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                        if (data.actionResult.action == "equip") {
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal(item.id, data.actionResult.slots["left-hand"], "item in slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should successfully equip item [item's center is less constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + 0.5, "y": player.y + 0.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.sid = data.sid
                        player.id = data.id
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
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })*/

            it("should successfully equip item [item's center is more constant pickUpRadius]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                var item = {"x": player.x + pickUpRadius + 1, "y": player.y + pickUpRadius + 1}
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
                        socket.enforce({"action": "equip", "id": item.id, "sid": player.sid, "slot": "left-hand"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "equip") {
                            assert.equal("badId", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["left-hand"], "no item in slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Unequip", function() {
            beforeEach(BF)
            it("should successfully unequip item", function(done) {
                var player = {"x": 3.5, "y": 3.5}
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
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [makeItem()], {"left-hand": makeItem()})
            })

            it("should fail unequip item [invalid slot specificator]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        player.sid = data.sid
                        socket.enforce({"action": "unequip", "sid": player.sid, "slot": "ear"})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        if (data.actionResult.action == "unequip") {
                            assert.equal("badSlot", data.actionResult.result, data.actionResult.action + " request")
                            socket.enforce({"action": "examine", "id": player.id, "sid": player.sid})
                        } else if (data.actionResult.action == "examine") {
                            assert.equal("ok", data.actionResult.result, data.actionResult.action + " request")
                            assert.equal(undefined, data.actionResult.slots["ear"], "no such slot")
                            socket.setOnMessage(undefined)
                            done()
                        }
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })

            it("should fail unequip item [slot doesn't exist in request]", function(done) {
                var player = {"x": 3.5, "y": 3.5}
                socket.setOnMessage(function(e) {
                    var data = JSON.parse(e.data)
                    switch(data.action) {
                    case "putPlayer":
                        assert.equal("ok", data.result, "put player")
                        player.id = data.id
                        player.sid = data.sid
                        socket.enforce({"action": "unequip", "sid": player.sid})
                        break
                    case "enforce":
                        assert.equal("ok", data.result, "enforce request")
                        assert.equal("badSlot", data.actionResult.result, data.actionResult.action + " request")
                        socket.setOnMessage(undefined)
                        done()
                    }
                })
                socket.putPlayer(player.x, player.y, {}, [], {})
            })
        })

        describe("Equip / Unequip", function() {
            beforeEach(BF)
            it("should successfully equip/unequip item", function(done) {
                var flag = true
                var player = {"x": 3.5, "y": 3.5}
                var item = {}
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
                                socket.setOnMessage(undefined)
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
    testItems: testItems,
    makeItem: makeItem
}

})