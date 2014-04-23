define(["test/mocha", "test/chai", "utils", "ws"],
function (m, chai, utils, ws) {

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
                setTimeout(done, 200)
            })

            describe("Dictionary", function() {
                describe("", function() {
                    before(function(done) {
                      ws.dictionary(userData.sid)
                        setTimeout(done, 200)
                    })

                    it("should return ok", function(done) {
                        var data = ws.getDictionary()
                        assert.equal("ok", data.result)
                        done()
                    })

                    it("should have properties ['.', '#']", function(done) {
                        var data = ws.getDictionary()
                        assert.property(data.dictionary, ".")
                        assert.property(data.dictionary, "#")
                        done()
                    })
                })

                before(function(done) {
                    ws.dictionary("123")
                    setTimeout(done, 200)
                })

                it("should return badSid", function(done) {
                    var data = ws.getDictionary()
                    assert.equal("badSid", data.result)
                    done()
                })

            })

            describe("Look", function() {
                before(function(done) {
                    ws.look(userData.sid)
                    setTimeout(done, 200)
                })

                it("should return ok", function() {
                    var response = ws.getLookData()
                    assert.equal("ok", response.result)
                })

                it("should have properties [map, actors]", function(done) {
                    var data = ws.getLookData()
                    assert.property(data, "map")
                    assert.property(data, "actors")
                    done()
                })

                it("coordinates must be defined", function() {
                    var data = ws.getLookData()
                    assert.isDefined(data.x)
                    assert.isDefined(data.y)
                })

                describe("", function() {
                    before(function(done) {
                        ws.look(".")
                        setTimeout(done, 200)
                    })

                    it("should return badSid", function() {
                        var data = ws.getLookData()
                        assert.equal("badSid", data.result)
                    })
                })
            })

            describe("Examine", function() {
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(done, 200)
                })

                it("should return ok", function() {
                    var data = ws.getExamineData()
                    assert.equal("ok", data.result)
                })

                it("id must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.id)
                })

                it("type must be player", function() {
                    var data = ws.getExamineData()
                    assert.equal("player", data.type)
                })

                it("login must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.login)
                })

                it("coordinates must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.x)
                    assert.isDefined(data.y)
                })

                describe("", function() {
                    before(function(done) {
                       ws.examine(".", userData.sid)
                        setTimeout(done, 200)
                    })

                    it("should return badId", function() {
                        var data = ws.getExamineData()
                        assert.equal("badId", data.result)
                    })
                })

                describe("", function() {
                    before(function(done) {
                        ws.examine(userData.id, ".")
                        setTimeout(done, 200)
                    })

                    it("should return badSid", function() {
                        var data = ws.getExamineData()
                        assert.equal("badSid", data.result)
                    })
                })

            })

            describe("Move", function() {
                before(function(done) {
                    ws.move("west", ws.getTick, userData.sid)
                    setTimeout(done, 200)
                })

                it("should return ok", function() {
                    var data = ws.getMoveData()
                    assert.equal("ok", data.result)
                })

                describe("", function() {
                    before(function(done) {
                        ws.move("west", ws.getTick, ".")
                        setTimeout(done, 200)
                    })

                    it("should return badSid", function() {
                        var data = ws.getMoveData()
                        assert.equal("badSid", data.result)
                    })
                })
            })
        })

        after(function() {
            var stop = utils.serverHandler({"action": "stopTesting"})
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