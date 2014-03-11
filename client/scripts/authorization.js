define(["jquery", "utils", "ws", "games"], function ($, utils, ws, games) {
    var sid;
    var wsUri;

    function registerCallback(data) {

        var serverAnswer = $("#server-answer");

        if (data == null)
        {
            serverAnswer.text("Data is null, request might be failed.").css("color", "red");

        } else if (data.result == "ok"){
            serverAnswer.text("Registration is successful.").css("color", "green");

        } else if (data.result == "loginExists") {
            serverAnswer.text("This login already exists.");

        } else if (data.result == "badLogin") {
            serverAnswer.text("Login: minimal length is 2 symbols and " +
                                    "maximum length is 36 symbols. Allowed charset is " +
                                    "latin symbols and numbers.").css("color", "red");

        } else if (data.result == "badPassword") {
            serverAnswer.text("Password: minimal length is 6 symbols and " +
                                    "maximum length is 36 symbols. Any character is "+
                                    "allowed except white space and TAB").css("color", "red");
        }
    }

    function loginCallback(data) {
        if(data.result == "ok") {
            $("#server-answer").text("Authentication is successful.").css("color", "green");
            $("#logout").css("visibility", "visible");

        } else if (data.result == "invalidCredentials") {
            $("#server-answer").text("Invalid login or password.").css("color", "red");
        }

        sid = data.sid;
        wsUri = data.webSocket;
        ws.startGame(sid, wsUri);
        location.href = "http://localhost:6543/map.html";
    }

    function logoutCallback(data) {
        if (data.result == "ok") {
            $("#server-answer").text("Lets to register or sign in.").css("color", "green");
            $("#logout").css("visibility", "hidden");

        } else if (data.result == "badSid") {
            $("#server-answer").text("Invalid session ID.").css("color", "red");
        }
    }

    function jsonHandle(action, callback) {
        if (action == "logout") {
            var js = {
                "action": "logout",
                "sid": sid
            }

        } else {
            var js = {
                "action": action,
                "login": $("#username").val(),
                "password": $("#password").val(),
            }
        }

        utils.postRequest(js, function (response) {
            $("#username, #password").val("");
            $("#server-answer").empty();
            callback(response);
        });
    }

    return {
        registerCallback: registerCallback,
        loginCallback: loginCallback,
        logoutCallback: logoutCallback,
        jsonHandle: jsonHandle
    };

});