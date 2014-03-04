define(["jquery"], function($){

    var sid;

    return {
        json: function(action){
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
                success: function(data){
                            $("#formregister").hide();
                            var items = [];
                            $.each(data, function(key, val){
                                if (key=="sid") 
                                {   
                                    sid = val;
                                }
                                else
                                    items.push("<li>" + key + " " + val + "</li>");
                                if (val=="ok" && action == "login" ) 
                                {
                                    var obBut = document.getElementById("logout");
                                    obBut.style.visibility = "visible"; 
                                }
                            });
                            $("<ul/>", {
                                html: items.join("")
                            }).appendTo("#content");
                    },
                error: function (ajaxRequest, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        },

        Exit: function() {
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
                success:  function (data){
                    $("#formexit").hide();
                    var items = [];
                    $.each(data, function(key, val){
                        items.push("<li>" + key + " " + val + "</li>");
                    });
                    $("<ul/>", {
                        html: items.join("")
                    }).appendTo("#content");
                }
            });
        }

    }
});