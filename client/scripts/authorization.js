define(["jquery"], function($) {
    var sid;

    return {
        handle: function(action) {
            var js = {
                "action": action,
                "login": $("#username").val(),
                "password": $("#password").val(),
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
                            $.each(data, function(key, val) {
                                if (action =="login") {
                                    sid = data.sid;
                                    if (data.result == "ok") {
                                        var logoutButton = document.getElementById("logout");
                                        logoutButton.style.visibility = "visible";
                                    }
                                }
                            });
                            $("<p/>", {
                                html: action + ": " + data.result
                            }).appendTo("#result");
                },
                error: function(ajaxRequest, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        },

        exit: function() {
            var js = {
                "action": "logout",
                "sid": sid
            }
            $.ajax({
                type: "post",
                dataType: "json", 
                url: location.href,
                data: JSON.stringify(js),
                ContentType: "application/json; charset=utf-8",
                success:  function (data) {
                    $("#result").empty();
                    var logoutButton = document.getElementById("logout");
                    logoutButton.style.visibility = "hidden";
                    $("<p/>", {
                        html: "logout: " + data.result
                    }).appendTo("#result");
                },
                error: function(ajaxRequest, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }

    }
});