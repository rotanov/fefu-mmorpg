define(["jquery", "mocha", "chai", "utils", "ws"],
function ($, m, chai, utils, ws) {

    function testHandler (list) {
        document.title = "Test"
        mocha.setup("bdd")
        var assert = chai.assert

        for (var i = 0; i < list.options.length; i++) {
            if (list.options[i].selected) {
                switch (list.options[i].value) {
                    case "register":
                        testRegister(assert)
                        break
                    case "websocket":
                        testWebSocket(assert)
                        break
                }
                mocha.run()
            }
        }
    }

    function serverHandler(object) {
        var responseResult

        utils.postRequest(object, function (response) {
            responseResult = response
        }, true)

        return responseResult
    }

    function testRegister(assert) {
        describe.only("Register", function() {
            describe.only("Registration", function() {
                it("(1) should return ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "register",
                        "login": "IvanPes",
                        "password": "123456"
                    }).result)
                })

                it("(2) should return ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "register",
                        "login": "Ivan123",
                        "password": "123456"
                    }).result)
                })

                it("(3) should return badPassword [too short]", function() {
                    assert.equal("badPassword", serverHandler({
                        "action": "register",
                        "login": "123Ivan",
                        "password": "123"
                    }).result)
                })

                it("(4) should return badPassword [too long]", function() {
                    assert.equal("badPassword", serverHandler({
                        "action": "register",
                        "login": "00Ivan00",
                        "password": "0123456789012345678901234567890123456789"
                    }).result)
                })

                it("(5) should return badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "  ", 
                        "password": "0123456"
                    }).result)
                })

                it("(6) should return badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "Иван", 
                        "password": "0123456"
                    }).result)
                })

                it("(7) should return badLogin [too short]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "A", 
                        "password": "0123456"
                    }).result)
                })

                it("(8) should return badLogin [too long]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "AaaaaBbbbbCccccDddddEeeeeFffffGggggHhhhh",
                        "password": "0123456"
                    }).result)
                })

                it("(9) should return loginExists", function() {
                    assert.equal("loginExists", serverHandler({
                        "action": "register",
                        "login": "IvanPes",
                        "password": "123456"
                    }).result)
                })
            })

            var sid
            describe("Login", function() {
                it("(10) should return ok", function() {
                    data = serverHandler({
                        "action": "login",
                        "login": "IvanPes",
                        "password": "123456"
                    })
                    sid = data.sid
                    wsUri = data.webSocket
                    assert.equal("ok", data.result)
                })

                it("(11) should return invalidCredentials"
                    + "[login does not exist]", function() {
                    assert.equal("invalidCredentials", serverHandler({
                        "action": "login",
                        "login": "Unknown",
                        "password": "123456"
                    }).result)
                })

                it("(12) should return invalidCredentials"
                    + "[incorrect password]", function() {
                    assert.equal("invalidCredentials", serverHandler({
                        "action": "login",
                        "login": "IvanPes",
                        "password": "Mumbo-jumbo"
                    }).result)
                })
            })

            describe("Logout", function() {
                it("(13) should return ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "logout",
                        "sid": sid
                    }).result)
                })

                it("(14) should return badSid", function() {
                    assert.equal("badSid", serverHandler({
                        "action": "logout",
                        "sid": sid
                    }).result)
                })

                it("(15) should return badSid", function() {
                    assert.equal("badSid", serverHandler({
                        "action": "logout",
                        "sid": ""
                    }).result)
                })
            })
        })
    }

    function testWebSocket(assert) {
        describe.only("WebSocket", function(done) {
            serverHandler({
                "action": "register",
                "login": "Pavel",
                "password": "111111"
            })

            userData = serverHandler({
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

                    it("(16) should return ok", function(done) {
                        var data = ws.getDictionary()
                        assert.equal("ok", data.result)
                        done()
                    })

                    it("(17) should have properties ['.', '#']", function(done) {
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

                it("(18) should return badSid", function(done) {
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

                it("(19) should return ok", function() {
                    var response = ws.getLookData()
                    assert.equal("ok", response.result)
                })

                it("(20) should have properties [map, actors]", function(done) {
                    var data = ws.getLookData()
                    assert.property(data, "map")
                    assert.property(data, "actors")
                    done()
                })

                it("(21) coordinates must be defined", function() {
                    var data = ws.getLookData()
                    assert.isDefined(data.x)
                    assert.isDefined(data.y)
                })

                describe("", function() {
                    before(function(done) {
                        ws.look(".")
                        setTimeout(done, 200)
                    })

                    it("(22) should return badSid", function() {
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

                it("(23) should return ok", function() {
                    var data = ws.getExamineData()
                    assert.equal("ok", data.result)
                })

                it("(24) id must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.id)
                })

                it("(25) type must be player", function() {
                    var data = ws.getExamineData()
                    assert.equal("player", data.type)
                })

                it("(26) login must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.login)
                })

                it("(27) coordinates must be defined", function() {
                    var data = ws.getExamineData()
                    assert.isDefined(data.x)
                    assert.isDefined(data.y)
                })

                describe("", function() {
                    before(function(done) {
                        ws.examine(".", userData.sid)
                        setTimeout(done, 200)
                    })

                    it("(28) should return badId", function() {
                        var data = ws.getExamineData()
                        assert.equal("badId", data.result)
                    })
                })

                describe("", function() {
                    before(function(done) {
                        ws.examine(userData.id, ".")
                        setTimeout(done, 200)
                    })

                    it("(29) should return badSid", function() {
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

                it("(30) should return ok", function() {
                    data = ws.getMoveData()
                    assert.equal("ok", data.result)
                })

                describe("", function() {
                    before(function(done) {
                        ws.move("west", ws.getTick, ".")
                        setTimeout(done, 200)
                    })

                    it("(30) should return badSid", function() {
                        data = ws.getMoveData()
                        assert.equal("badSid", data.result)
                    })
                })
            })
        })
    }

    return {
        serverHandler: serverHandler,
        testHandler: testHandler
    }

})