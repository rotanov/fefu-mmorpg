define(["jquery"], function($) {
    var sid;

    return {
        handle: function(action) {
            var js;
            if (action == "logout") {
                js = {
                    "action": "logout",
                    "sid": sid
                }
            }
            else {
                js = {
                    "action": action,
                    "login": $("#username").val(),
                    "password": $("#password").val(),
                }
            }
            $.ajax({
                type: "post",
                dataType: "json",
                url: location.href,
                data: JSON.stringify(js),
                ContentType: "application/json; charset=utf-8",
                success: function(data) {
                            document.getElementById("formregister").reset();
                            $("#result").empty();
                            var logoutButton = document.getElementById("logout");
                            if (action =="login") {
                                sid = data.sid;
                                if (data.result == "ok") {
                                    logoutButton.style.visibility = "visible";
                                }
                            }
                            if (action == "logout" && data.result == "ok") {
                                logoutButton.style.visibility = "hidden";
                            }
                            $("<p/>", {
                                html: action + ": " + data.result
                            }).appendTo("#result");
                },
                error: function(ajaxRequest, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    }
});