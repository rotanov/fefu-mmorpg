require(["jquery", "authorization", "test"], function($, auth, test) {

    var url = $("#server").val();

    $("#register").click(function() {
        auth.jsonHandle("register", auth.registerCallback, url);
    });

    $("#login").click(function() {
        auth.jsonHandle("login", auth.loginCallback, url);
    });

    $("#test").click(function() {
        $("#content").hide();
        test.runTests();
        test.clearDB();
    });

    $("#logout").click(function() {
        auth.jsonHandle("logout", auth.logoutCallback, url);
    });

    $(document).ready(function() {
        $("#server").attr("value", location.origin);
    });

});