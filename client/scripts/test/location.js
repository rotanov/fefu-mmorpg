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
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("west", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var xClient = Math.round(examineData.x - time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient, xServer)
                    assert.equal(examineData.y, ws.getExamineData().y)
                })
            })

            describe("Move left again", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("west", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var xClient = Math.round(examineData.x - time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient, xServer)
                    assert.equal(examineData.y, ws.getExamineData().y)
                })
            })

            describe("Move right", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("east", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var xClient = Math.round(examineData.x + time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient/10, xServer)
                    assert.equal(examineData.y, ws.getExamineData().y)
                })
            })

            describe("Move right again", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("east", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var xClient = Math.round(examineData.x + time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient/10, xServer)
                    assert.equal(examineData.y, ws.getExamineData().y)
                })
            })

            describe("Move up", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("north", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var yClient = Math.round(examineData.y + time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient/10, yServer)
                    assert.equal(examineData.x, ws.getExamineData().x)
                })
            })

            describe("Move up again", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("north", lastTick, userData.sid)
                        newTick = ws.getTick()
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var yClient = Math.round(examineData.y + time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient/10, yServer)
                    assert.equal(examineData.x, ws.getExamineData().x)
                })
            })

            describe("Move down", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("south", lastTick, userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            newTick = ws.getTick()
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var yClient = Math.round(examineData.y - time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient, yServer)
                    assert.equal(examineData.x, ws.getExamineData().x)
                })
            })

            describe("Move down again", function() {
                var examineData
                var lastTick
                var newTick
                before(function(done) {
                    ws.examine(userData.id, userData.sid)
                    setTimeout(function() {
                        examineData = ws.getExamineData()
                        lastTick = ws.getTick()
                        ws.move("south", lastTick, userData.sid)
                        setTimeout(function() {
                            ws.examine(userData.id, userData.sid)
                            newTick = ws.getTick()
                            setTimeout(done, 200)
                        }, 200)
                    }, 200)
                })

                it("should return ok", function() {
                    var time = (newTick - lastTick) / ticksPerSecond
                    var yClient = Math.round(examineData.y - time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient, yServer)
                    assert.equal(examineData.x, ws.getExamineData().x)
                })
            })
        })
    }

    return {
        testLocation: testLocation
    }

})