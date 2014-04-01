require(["jquery","phaser", "authorization", "test/test", "utils", "packages"],
function ($,phaser, auth, test, utils, packages) {

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
        $("#mocha").empty()
        utils.serverHandler(packages.startTest())
        var response = utils.serverHandler(packages.consts())
        if (response.result == "invalidRequest") {
            $("#server-answer").text("Data is null, request "
                + "might be failed.").css("color", "red")
        } else {
            var list = document.getElementById("tests")
            test.testHandler(list)
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

})