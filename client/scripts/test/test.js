define(["lib/mocha", "test/register", "test/websocket", "test/items", "test/mobs"],
function (m, tr, tw, ti, tm) {

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

        case "items":
            ti.testItems()
            break

        case "mobs":
            tm.testMobs()
            break
    }
}

return {
    testHandler: testHandler
}

})