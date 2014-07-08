define(["lib/mocha", "test/register", "test/websocket", "test/location"],
function (m, tr, tw, tl) {

    function testHandler(list) {
        document.title = "Test"
        $("#mocha, #msg").empty()
        mocha.setup("bdd")

        switch ($("#tests").find(":selected").text()) {
            case "register":
                tr.testRegister()
                break

            case "websocket":
                tw.testWebSocket()
                break

            case "location":
                tl.testLocation()
                break
        }
    }

    return {
        testHandler: testHandler
    }

})