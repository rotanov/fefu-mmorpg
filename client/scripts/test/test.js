define(["jquery", "utils", "packages", "test/mocha", "test/chai", "test/register", "test/websocket", "test/location"],
function ($, utils, packages, m, chai, tr, tw, tl) {

    function testHandler (list) {
        document.title = "Test"
        $("#mocha, #msg").empty()
        mocha.setup("bdd")
        var assert = chai.assert

        switch ($("#tests").find(":selected").text()) {
            case "register":
                var action = utils.serverHandler({"action": "startTesting"})
                if (action.result == "ok") {
                    var response = utils.serverHandler(packages.consts())

                    if (response.result == "ok") {
                        tr.testRegister(assert)


                    } else if (response.result == "badAction") {
                        $("#msg").text("Invalid action.")
                        .css("color", "red")
                    }

                } else if (action.result == "badAction") {
                    $("#msg").text("Invalid action.")
                    .css("color", "red")
                }
                break

            case "websocket":
                var action = utils.serverHandler({"action": "startTesting"})
                if (action.result == "ok") {
                    var response = utils.serverHandler(packages.consts())

                    if (response.result == "ok") {
                        tw.testWebSocket(assert)

                    } else if (response.result == "badAction") {
                        $("#msg").text("Invalid action.")
                        .css("color", "red")
                    }

                } else if (action.result == "badAction") {
                    $("#msg").text("Invalid action.")
                    .css("color", "red")
                }
                break

            case "location":
                var action = utils.serverHandler({"action": "startTesting"})
                if (action.result == "ok") {
                    var response = utils.serverHandler(packages.consts())

                    if (response.result == "ok") {
                        tl.testLocation(assert)

                    } else if (response.result == "badAction") {
                        $("#msg").text("Invalid action.")
                        .css("color", "red")
                    }

                } else if (action.result == "badAction") {
                    $("#msg").text("Invalid action.")
                    .css("color", "red")
                }
                break
        }
        mocha.run()
    }

    return {
        testHandler: testHandler
    }

})