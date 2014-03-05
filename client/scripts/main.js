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
    });
    $("#logout").click(function() {
        auth.exit();
    });
    $("#Ok").click(function() {
        var url = document.getElementById("href");
        window.location = url.value;
    })

});