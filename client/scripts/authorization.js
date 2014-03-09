define(["jquery"], function($) {
    var sid;

    return {
        registerCallback: function(data) {
            if(data.result == "ok"){
                $("#server-answer").text("Registration is successful.").css("color", "green");
            } else if(data.result == "loginExists") {
                $("#server-answer").text("This login already exists.");
            } else if(data.result == "badLogin") {
                $("#server-answer").text("Login: minimal length is 2 symbols and " +
                                        "maximum length is 36 symbols. Allowed charset is " +
                                        "latin symbols and numbers.").css("color", "red");
            } else if(data.result == "badPassword") {
                $("#server-answer").text("Password: minimal length is 6 symbols and " +
                                        "maximum length is 36 symbols. Any character is "+
                                        "allowed except white space and TAB").css("color", "red");
            }
        },

        loginCallback: function(data) {
            if(data.result == "ok") {
                $("#server-answer").text("Authentication is successful.").css("color", "green");
                $("#logout").css("visibility", "visible");
            } else if(data.result == "invalidCredentials") {
                $("#server-answer").text("Invalid login or password.").css("color", "red");
            }
            sid = data.sid;
        },

        logoutCallback: function(data) {
            if(data.result == "ok") {
                $("#server-answer").text("Lets to sign up or sign in.").css("color", "green");
                $("#logout").css("visibility", "hidden");
            } else if(data.result == "badSid") {
                $("#server-answer").text("Invalid session ID.").css("color", "red");
            }
        },

        jsonHandle: function(action, callback, url) {
            if (action == "logout") {
                var js = {
                    "action": "logout",
                    "sid": sid
                }
            }
            else {
                var js = {
                    "action": action,
                    "login": $("#username").val(),
                    "password": $("#password").val(),
                }
            }
            $.ajax({
            type: "post",
            dataType: "json",
            url: url,
            data: JSON.stringify(js),
            ContentType: "application/json; charset=utf-8",
            success: function(data) {
                    document.getElementById("formregister").reset();
                    $("#server-answer").empty();
                    callback(data);
            },
            error: function(ajaxRequest, ajaxOptions, thrownError) {
                    console.log(thrownError);
            }
         });
        }
    };

});