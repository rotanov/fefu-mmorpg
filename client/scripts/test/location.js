define(["packages", "utils", "ws"],
function(packages, utils, ws) {

    function testLocation(assert) {

        describe.only("Location", function(done) {
            var playerVelocity = packages.consts().playerVelocity
            var ticksPerSecond = packages.consts().ticksPerSecond

            utils.serverHandler({
                "action": "register",
                "login": "Location",
                "password": "Location"
            })

            var userData = utils.serverHandler({
                "action": "login",
                "login": "Location",
                "password": "Location"
            })

            before(function(done) {
                ws.startGame(userData.id, userData.sid, userData.webSocket)
                setTimeout(done, 200)
            })

            describe("Upload map to server", function() {
                it("should return badMap", function() {
                    var map = [
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", "$", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."]
                    ]

                    assert.equal("badMap", utils.serverHandler({
                        "action": "setUpMap",
                        "map": map
                    }).result)
                })

                it("should return badAction [mast setUpMap]", function() {
                    var map = [
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."]
                    ]

                    assert.equal("badAction", utils.serverHandler({
                        "action": "uploadMap",
                        "map": map
                    }).result)
                })

                it("should return ok", function() {
                    var map = [
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."],
                        [".", ".", ".", ".", ".", ".", "."]
                    ]

                    assert.equal("ok", utils.serverHandler({
                        "action": "setUpMap",
                        "map": map
                    }).result)
                })
            })

            describe("Set Up / Get Constants", function() {
                it("should return ok", function() {
                    assert.equal("ok", utils.serverHandler(
                        packages.consts()
                    ).result)
                })

                it("should return badAction [mast setUpConst]", function() {
                    assert.equal("badAction", utils.serverHandler({
                        "action": "setUploadConst",
                        "playerVelocity": 1.0,
                        "slideThreshold": 0.1,
                        "ticksPerSecond": 60,
                        "screenRowCount": 7,
                        "screenColumnCount": 9
                    }).result)
                })

                it("should return ok", function() {
                    var response = utils.serverHandler({"action": "getConst"})
                    assert.equal("ok", response.result)
                    assert.equal(packages.consts().playerVelocity, response.playerVelocity)
                    assert.equal(packages.consts().slideThreshold, response.slideThreshold)
                    assert.equal(packages.consts().ticksPerSecond, response.ticksPerSecond)
                    assert.equal(packages.consts().screenRowCount, response.screenRowCount)
                    assert.equal(packages.consts().screenColumnCount, response.screenColumnCount)
                })
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
                    var xClient = Math.round(examineData.x + time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient, xServer)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
                    var xClient = Math.round(examineData.x + time * playerVelocity)
                    var xServer = Math.round(ws.getExamineData().x)
                    assert.equal(xClient, xServer)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
                    var yClient = Math.round(examineData.y + time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient, yServer)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
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
                    var time = Math.round((newTick - lastTick) / ticksPerSecond)
                    var yClient = Math.round(examineData.y - time * playerVelocity)
                    var yServer = Math.round(ws.getExamineData().y)
                    assert.equal(yClient, yServer)
                    assert.equal(examineData.x, ws.getExamineData().x)
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
        testLocation: testLocation
    }

})