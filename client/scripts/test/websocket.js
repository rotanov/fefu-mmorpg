define(["test/mocha", "utils", "ws"],
function (m, utils, ws) {

    function testWebSocket(assert) {
        describe.only("WebSocket", function(done) {
            utils.serverHandler({
                "action": "register",
                "login": "Pavel",
                "password": "111111"
            })

            userData = utils.serverHandler({
                "action": "login",
                "login": "Pavel",
                "password": "111111"
            })

            before(function(done) {
                ws.startGame(userData.id, userData.sid, userData.webSocket)
                if (ws.readyState === 1) {
                    done
                } else {
                    setTimeout(done, 200)
                }
            })

            describe("getDictionary", function() {
                it("should return ok", function() {
                    $.when(ws.getDictionary(userData.sid), ws.timeout(200, ws.getDictionData()))
                    .done(function (getDictionary, data) {
                        assert.equal("ok", data.result)
                    })
                })

                it("should have properties ['.', '#']", function() {
                    $.when(ws.getDictionary(userData.sid), ws.timeout(200, ws.getDictionData()))
                    .done(function (getDictionary, data) {
                    console.log(data);
                        assert.property(data.dictionary, ".")
                        assert.property(data.dictionary, "#")
                    })
                })

                it("should return badSid", function() {
                    $.when(ws.getDictionary("123"), ws.timeout(200, ws.getDictionData()))
                    .done(function (getDictionary, data) {
                        assert.equal("badSid", data.result)
                    })
                })
            })

            describe("Look", function() {
                it("should return ok", function() {
                    $.when(ws.look(userData.sid), ws.timeout(200, ws.getLookData()))
                    .done(function (look, data) {
                        assert.equal("ok", data.result)
                    })
                })

                it("should have properties [map, actors]", function() {
                    $.when(ws.look(userData.sid), ws.timeout(200, ws.getLookData()))
                    .done(function (look, data) {
                        assert.property(data, "map")
                        assert.property(data, "actors")
                    })
                })

                it("coordinates must be defined", function() {
                    $.when(ws.look(userData.sid), ws.timeout(200, ws.getLookData()))
                    .done(function (look, data) {
                        assert.isDefined(data.x)
                        assert.isDefined(data.y)
                    })
                })

                it("should return badSid", function() {
                    $.when(ws.look("."), ws.timeout(200, ws.getLookData()))
                    .done(function (look, data) {
                        assert.equal("badSid", data.result)
                    })
                })
            })

            describe("Examine", function() {
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.equal("ok", data.result)
                    })
                })

                it("id must be defined", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        ssert.isDefined(data.id)
                    })
                })

                it("type must be player", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.equal("player", data.type)
                    })
                })

                it("login must be defined", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.isDefined(data.login)
                    })
                })

                it("coordinates must be defined", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.isDefined(data.x)
                        assert.isDefined(data.y)
                    })
                })

                it("should return badId", function() {
                    $.when(ws.examine(".", userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.equal("badId", data.result)
                    })
                })

                it("should return badSid", function() {
                    $.when(ws.examine(userData.id, "."), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data) {
                        assert.equal("badSid", data.result)
                    }) 
                })
            })

            describe("Move", function() {
                it("should return ok", function() {
                    $.when(ws.move("west", ws.getTick, userData.sid), ws.timeout(200, ws.getMoveData()))
                    .done(function (move, data) {
                        assert.equal("ok", data.result)
                    }) 
                })

                it("should return badSid", function() {
                    $.when(ws.move("west", ws.getTick, "."), ws.timeout(200, ws.getMoveData()))
                    .done(function (move, data) {
                        assert.equal("badSid", data.result)
                    }) 
                })
            })
        })

        after(function() {
            var stop = utils.serverHandler({"action": "stopTesting"}).result
            if (stop == "badAction") {
                $("#msg").text("Invalid action.")
                .css("color", "red")
            } else if (stop == "ok") {
                $("#msg").text("Test is successful.")
                .css("color", "green")
            }
        });
    }

    return {
        testWebSocket: testWebSocket
    }

})