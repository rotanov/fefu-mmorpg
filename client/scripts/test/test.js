define(["jquery", "test/mocha", "test/chai", "test/register", "test/websocket"],
function ($, m, chai, tr, tw) {

    function testHandler (list) {
        document.title = "Test"
        mocha.setup("bdd")
        var assert = chai.assert

        for (var i = 0; i < list.options.length; i++) {
            if (list.options[i].selected) {
                switch (list.options[i].value) {
                    case "register":
                        tr.testRegister(assert)
                        break
                    case "websocket":
                        tw.testWebSocket(assert)
                        break
                }
                mocha.run()
            }
        }
    }

    return {
        testHandler: testHandler
    }

})