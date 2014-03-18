define(["jquery", "mocha", "chai", "authorization", "utils"],
function ($, m, chai, auth, utils) {

    function serverHandler(object) {
        var responseResult

        utils.postRequest(object, function (response) {
            responseResult = response
        }, true)

        return responseResult
    }

    function clearDB() {
        utils.postRequest({"action": "clearDb"}, function() {}, true)
    }

    return {
        clearDB: clearDB,
        runTests: function() {
            document.title = "Test"
            mocha.setup("bdd")
            var assert = chai.assert

            describe("Testing request handler", function() {

                describe("Registration", function() {

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
                            "login": "AaaaBbbbCcccDdddEeeeFfffGgggHhhh",
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
                        assert.equal("ok", data.result)
                    })

                    it("(11) should return invalidCredentials"
                        "[login does not exist]", function() {
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

            var runner = mocha.run()
            clearDB()
        }
    }
    
});