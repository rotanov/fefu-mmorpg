require(["jquery", "phaser", "authorization", "test/test", "utils", "packages"],
function ($, phaser, auth, test, utils, packages) {

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
        $("#content").hide()
        $("#mocha, #msg").empty()

        var action = utils.serverHandler({"action": "startTesting"})
        if (action.result == "ok") {
            var response = utils.serverHandler(packages.consts())

            if (response.result == "ok") {
                var list = document.getElementById("tests")
                test.testHandler(list)

            } else if (response.result == "badAction") {
                $("#server-answer").text("Invalid action.")
                .css("color", "red")
            }

        } else if (action.result == "badAction") {
            $("#server-answer").text("Invalid action.")
            .css("color", "red")
        }
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