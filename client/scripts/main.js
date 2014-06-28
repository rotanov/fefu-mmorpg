require(["jquery", "phaser", "authorization", "test/test", "utils", "packages"],
function ($, phaser, auth, test, utils, packages) {
    $("#inf-about-obj").hide()
    $("#items").hide()

    $("#register").click(function() {
        auth.jsonHandle("register", auth.registerCallback)
    })

    $("#login").click(function() {
        auth.jsonHandle("login", auth.loginCallback)
    })

    $("#logout").click(function() {
        auth.jsonHandle("logout", auth.logoutCallback)
    })

    $("#test").click(function() {
        $("#content, #test-form").hide()
        test.testHandler()
    })

    $(document).ready(function() {
        $("#server-address").change(function() {
            utils.setServerAddress($("#server-address").val())
        })

        var serverAddress = location.origin
        if (location.protocol == "file:") {
            serverAddress = "http://localhost:6543"
        }

        $("#server-address").attr("value", serverAddress)
        utils.setServerAddress(serverAddress)
    })

    window.onbeforeunload = function() {
        auth.jsonHandle("logout", auth.logoutCallback);
    }

})