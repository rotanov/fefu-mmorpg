require(["jquery", "authorization", "test"], function($, auth, test) {
    var url = "";
    $("#register").click(function() {
        url = $("#server").val();
        auth.jsonHandle("register", auth.registerCallback, url);
        $("#server").attr("value", url);
    });

    $("#login").click(function() {
        url = $("#server").val();
        auth.jsonHandle("login", auth.loginCallback, url);
        $("#server").attr("value", url);
    });

    $("#test").click(function() {
        $("#content").hide();
        test.runTests();
        test.clearDB();
    });

    $("#logout").click(function(){
        url = $("#server").val();
        auth.jsonHandle("logout", auth.logoutCallback, url);
        $("#server").attr("value", url);
    });

    $(document).ready(function() {
        $("#server").attr("value", location.origin);
    });

});