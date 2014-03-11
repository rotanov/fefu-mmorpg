require(["jquery","phaser", "authorization", "test", "utils", "ws", "games"], function ($,phaser, auth, test, utils, ws, games) {

    $("#register").click(function() {
        auth.jsonHandle("register", auth.registerCallback);
    });

    $("#login").click(function() {
        auth.jsonHandle("login", auth.loginCallback);
    });

    $("#test").click(function() {
        $("#content").hide();
        test.runTests();
    });

    $("#logout").click(function() {
        auth.jsonHandle("logout", auth.logoutCallback);
    });

    $(document).ready(function() {
        $("#server-address").change(function() {
            utils.setServerAddress($("#server-address").val());
        });

        var serverAddress = location.origin
        if (location.protocol == "file:") {
            serverAddress = "http://localhost:6543";
        }

        $("#server-address").attr("value", serverAddress);
        utils.setServerAddress(serverAddress);
    });

});