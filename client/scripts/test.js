define(["jquery", "mocha", "chai"], function($, m, chai) {


    function serverHandler(enterJson) {
        var response;
        $.ajax({
            type: "post",
            dataType: "json",
            url: location.href,
            data: JSON.stringify(enterJson),
            ContentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                response = data.result;
            },
            error: function (ajaxRequest, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });

        return response;
    };

    function clearDB() {
        $.ajax({
            type: "post",
            dataType: "json", 
            url: location.href,
            data: JSON.stringify({"action": "clearDb"}),
            success:  function (data){
                console.log("success");
            },
            error: function (ajaxRequest, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    return {
        runTests: function()
        {
            document.title = "test";
            mocha.setup("bdd");
            var assert = chai.assert;

            describe.only("Testing request handler [function handle()]", function() {
                var enterJson1 = {
                    "action": "register",
                    "login": "IvanPes",
                    "password": "123456",
                };

                it.only("(1) Registration: should returnt ok", function() {
                    assert.equal("ok", serverHandler(enterJson1));
                });

                var enterJson2 = {
                   "action": "register",
                   "login": "Ivan123",
                    "password": "123456",
                };

                it.only("(2) Registration: should returnt ok", function() {
                    assert.equal("ok", serverHandler(enterJson2));
                });

                var enterJson3 = {
                    "action": "register",
                    "login": "123Ivan",
                    "password": "123",
                };

                it.only("(3) Registration: should returnt badPassword [too short]", function() {
                    assert.equal("badPassword", serverHandler(enterJson3));
                });

                var enterJson4 = {
                    "action": "register",
                    "login": "00Ivan00",
                    "password": "0123456789012345678901234567890123456789",
                };

                it.only("(4) Registration: should returnt badPassword [too long]", function() {
                    assert.equal("badPassword", serverHandler(enterJson4));
                });

                var enterJson5 = {
                    "action": "register",
                    "login": "  ", 
                    "password": "0123456",
                };

                it.only("(5) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler(enterJson5));
                });

                var enterJson6 = {
                    "action": "register",
                    "login": "Иван", 
                    "password": "0123456",
                };

                it.only("(6) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler(enterJson6));
                });

                var enterJson7 = {
                    "action": "register",
                    "login": "A", 
                    "password": "0123456",
                };

                it.only("(7) Registration: should returnt badLogin [too short]", function() {
                    assert.equal("badLogin", serverHandler(enterJson7));
                });

                var enterJson8 = {
                   "action": "register",
                   "login": "AaaaaBbbbbCccccDddddEeeeeFffffGggggHhhhh", 
                   "password": "0123456",
                };

                it.only("(8) Registration: should returnt badLogin [too long]", function() {
                    assert.equal("badLogin", serverHandler(enterJson8));
                });

                var enterJson9 = {
                   "action": "register",
                    "login": "IvanPes",
                   "password": "123456",
                };

                it.only("(9) Registration: should returnt loginExists", function() {
                    assert.equal("loginExists", serverHandler(enterJson9));
                });

                var enterJson10 = {
                   "action": "login",
                    "login": "IvanPes",
                   "password": "123456",
                };

                it.only("(10) Login: should returnt ok", function() {
                    assert.equal("ok", serverHandler(enterJson10));
                });

                var enterJson11 = {
                   "action": "login",
                    "login": "Unknown",
                   "password": "123456",
                };

                it.only("(11) Login: should returnt invalidCredentials [login does not exist]", function() {
                    assert.equal("invalidCredentials", serverHandler(enterJson11));
                });

                var enterJson12 = {
                   "action": "login",
                    "login": "IvanPes",
                   "password": "Mumbo-jumbo",
                };

                it.only("(12) Login: should returnt invalidCredentials [incorrect password]", function() {
                    assert.equal("invalidCredentials", serverHandler(enterJson12));
                });
            });

            var runner = mocha.run();
            clearDB();
        }
    }
    
});