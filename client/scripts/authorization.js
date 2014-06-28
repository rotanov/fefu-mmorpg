define(["jquery", "utils", "ws", "new_game/new_game"],
function ($, utils, ws, game) {

    var sid_

    function registerCallback(data) {

        var serverAnswer = $("#server-answer")

        if (data == null)
        {
            serverAnswer.text("Data is null, request might be failed.").css("color", "red")

        } else if (data.result === "ok") {
            //serverAnswer.text("Registration is successful.").css("color", "green")
            jsonHandle("login", loginCallback)

        } else if (data.result === "loginExists") {
            $("#username, #password").val("")
            serverAnswer.text("This login already exists.").css("color", "red")

        } else if (data.result === "badLogin") {
            $("#username, #password").val("")
            serverAnswer.text("Login: minimal length is 2 symbols and "
                + "maximum length is 36 symbols. Allowed charset is "
                + "latin symbols and numbers.").css("color", "red")

        } else if (data.result === "badPassword") {
            $("#username, #password").val("")
            serverAnswer.text("Password: minimal length is 6 symbols and "
                + "maximum length is 36 symbols.").css("color", "red")
        }
    }

    function loginCallback(data) {
        if (data.result === "ok") {
            $("#server-answer").text("Authentication is successful.").css("color", "green")
            $("#logout").css("visibility", "visible")
            sid_ = data.sid
            var consts = utils.serverHandler({"action": "getConst"})
            $.when(
                game.initSocket(data.webSocket),
                ws.timeout(
                    1000,
                    function() {
                        $("#content").hide()
                        $("#test-form").hide()
                        $("#items").show()
                    })
            ).done(
                function() {
                    game.start(data.id, data.sid, consts.screenRowCount, consts.screenColumnCount)
                }
            )

        } else if (data.result === "invalidCredentials") {
            $("#password").val("")
            $("#server-answer").text("Invalid login or password.").css("color", "red")
        }
    }

    function logoutCallback(data) {
        if (data.result === "ok") {
            $("#server-answer").text("Lets to register or sign in.").css("color", "green")
            $("#logout").css("visibility", "hidden")
            location.href = utils.getServerAddress()

        } else if (data.result === "badSid") {
            $("#server-answer").text("Invalid session ID.").css("color", "red")
        }
    }

    function jsonHandle(action, callback) {
        if (action == "logout") {
            var js = {
                "action": "logout",
                "sid": sid_
            }

        } else {
            var js = {
                "action": action,
                "login": $("#username").val(),
                "password": $("#password").val()
            }
        }

        utils.postRequest(js, function (response) {
            $("#server-answer").empty()
            callback(response)
        });
    }

    return {
        registerCallback: registerCallback,
        loginCallback: loginCallback,
        logoutCallback: logoutCallback,
        jsonHandle: jsonHandle
    }

})