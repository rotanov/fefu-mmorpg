define(["jquery", "lib/chai", "utils/utils", "utils/socket"],
function($, chai, utils, ws) {

var tick
var socket
var userData

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
        socket.startTesting()
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
    socket.startTesting()
    var assert = chai.assert

    describe.only("WebSocket", function(done) {

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
        socket.stopTesting()
        //socket.setOnMessage(undefined)
    })
    mocha.run()
}

return {
    testWebSocket: testWebSocket
}

})