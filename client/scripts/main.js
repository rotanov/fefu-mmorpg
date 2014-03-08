require(["jquery", "authorization", "test"], function($, auth, test) {

    $("#register").click(function() {
        auth.jsonHandle("register", auth.registerCallback);
    });

    $("#login").click(function() {
        auth.jsonHandle("login", auth.loginCallback);
    });

    $("#test").click(function() {
        $("#content").hide();
        test.runTests();
        test.clearDB();
    });

    $("#logout").click(function() {
        auth.jsonHandle("logout", auth.logoutCallback);
    });

    $("#Ok").click(function() {
        var url = document.getElementById("href");
        window.location = url.value;
    })

    $(document).ready(function(){
        $("#href").attr("value", location.origin);
    });

});