require(["jquery", "authorization", "test"], function($, auth, test) {

    $("#register").click(function() {
        auth.handle("register");
    });
    $("#login").click(function() {
        auth.handle("login");
    });
    $("#test").click(function() {
        $("#content").hide();
        test.runTests();
        test.clearDB();
    });
    $("#logout").click(function() {
        auth.handle("logout");
    });
    $("#Ok").click(function() {
        var url = document.getElementById("href");
        window.location = url.value;
    })

});