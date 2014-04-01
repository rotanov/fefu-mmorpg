define(["packages", "utils", "ws"],
function(packages, utils, ws) {

    function testLocation(assert) {

        describe.only("Location", function(done) {
            var map = packages.startTest().map
            var playerVelocity = packages.consts().playerVelocity
            var ticksPerSecond = packages.consts().ticksPerSecond

            utils.serverHandler({
                "action": "register",
                "login": "Location",
                "password": "Location"
            })

            userData = utils.serverHandler({
                "action": "login",
                "login": "Location",
                "password": "Location"
            })

            before(function(done) {
                ws.startGame(userData.id, userData.sid, userData.webSocket)
                setTimeout(done, 200)
            })

            describe("Move left", function() {
                var examineData
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        ws.move("west", ws.getTick(), userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var x = examineData.x - ws.getTick() * ticksPerSecond * playerVelocity
                    assert.equal(x, ws.getExamineData().x)
                })
            })

            describe("Move right", function() {
                var examineData
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        ws.move("east", ws.getTick(), userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var x = examineData.x + ws.getTick() * ticksPerSecond * playerVelocity
                    assert.equal(x, ws.getExamineData().x)
                })
            })

            describe("Move up", function() {
                var examineData
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        ws.move("north", ws.getTick(), userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var y = examineData.y + ws.getTick() * ticksPerSecond * playerVelocity
                    assert.equal(y, ws.getExamineData().y)
                })
            })

            describe("Move down", function() {
                var examineData
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        ws.move("south", ws.getTick(), userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var y = examineData.y - ws.getTick() * ticksPerSecond * playerVelocity
                    assert.equal(y, ws.getExamineData().y)
                })
            })
        })
    }

    return {
        testLocation: testLocation
    }

})