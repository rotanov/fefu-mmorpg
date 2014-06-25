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

                it("should return badAction [must setUpConst]", function() {
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
                    assert.equal(packages.consts().slideThreshold, (response.slideThreshold).toFixed(1))
                    assert.equal(packages.consts().ticksPerSecond, response.ticksPerSecond)
                    assert.equal(packages.consts().screenRowCount, response.screenRowCount)
                    assert.equal(packages.consts().screenColumnCount, response.screenColumnCount)
                })
            })

            describe("Move left", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("west", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var xClient = Math.round(data_1.x - time * playerVelocity)
                                var xServer = Math.round(data_2.x)
                                assert.equal(xClient, xServer)
                                assert.equal(data_1.y, data_2.y)
                            })
                        })
                    })
                })
            })

            describe("Move left again", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("west", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var xClient = Math.round(data_1.x - time * playerVelocity)
                                var xServer = Math.round(data_2.x)
                                assert.equal(xClient, xServer)
                                assert.equal(data_1.y, data_2.y)
                            })
                        })
                    })
                })
            })

            describe("Move right", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("east", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var xClient = Math.round(data_1.x + time * playerVelocity)
                                var xServer = Math.round(data_2.x)
                                assert.equal(xClient, xServer)
                                assert.equal(data_1.y, data_2.y)
                            })
                        })
                    })
                })
            })

            describe("Move right again", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("east", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var xClient = Math.round(data_1.x + time * playerVelocity)
                                var xServer = Math.round(data_2.x)
                                assert.equal(xClient, xServer)
                                assert.equal(data_1.y, data_2.y)
                            })
                        })
                    })
                })
            })

            describe("Move up", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("north", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var yClient = Math.round(data_1.y + time * playerVelocity)
                                var yServer = Math.round(data_2.y)
                                assert.equal(yClient, yServer)
                                assert.equal(data_1.x, data_2.x)
                            })
                        })
                    })
                })
            })

            describe("Move up again", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("north", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var yClient = Math.round(data_1.y + time * playerVelocity)
                                var yServer = Math.round(data_2.y)
                                assert.equal(yClient, yServer)
                                assert.equal(data_1.x, data_2.x)
                            })
                        })
                    })
                })
            })

            describe("Move down", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("south", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var yClient = Math.round(data_1.y - time * playerVelocity)
                                var yServer = Math.round(data_2.y)
                                assert.equal(yClient, yServer)
                                assert.equal(data_1.x, data_2.x)
                            })
                        })
                    })
                })
            })

            describe("Move down again", function() {
                var examineData
                var lastTick
                var newTick
                it("should return ok", function() {
                    $.when(ws.examine(userData.id, userData.sid), ws.timeout(200, ws.getExamineData()))
                    .done(function (examine, data_1) {
                        lastTick = ws.getTick()
                        $.when(ws.move("south", lastTick, userData.sid), ws.timeout(200, ws.getMoveData))
                        .done(function (move, data) {
                            newTick = ws.getTick()
                            $.when(ws.examine(userData.id, userData.sid), ws.getExamineData())
                            .done(function (examine, data_2) {
                                newTick = ws.getTick()
                                var time = Math.round((newTick - lastTick) / ticksPerSecond)
                                var yClient = Math.round(data_1.y - time * playerVelocity)
                                var yServer = Math.round(data_2.y)
                                assert.equal(yClient, yServer)
                                assert.equal(data_1.x, data_2.x)
                            })
                        })
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
        testLocation: testLocation
    }

})