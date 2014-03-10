define(["jquery", "mocha", "chai", "authorization", "utils"], function ($, m, chai, auth, utils) {

    function serverHandler(object) {
        var responseResult;

        utils.postRequest(object, function (response) {
            responseResult = response.result;
        }, true);

        return responseResult;
    };

    function clearDB() {
        utils.postRequest({"action": "clearDb"}, function() {}, true);
    };

    return {
        clearDB: clearDB,
        runTests: function()
        {
            document.title = "test";
            mocha.setup("bdd");
            var assert = chai.assert;

            describe.only("Testing request handler [function jsonHandle()]", function() {

                it.only("(1) Registration: should returnt ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "register",
                        "login": "IvanPes",
                        "password": "123456"
                    }));
                });

                it.only("(2) Registration: should returnt ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "register",
                        "login": "Ivan123",
                        "password": "123456"
                    }));
                });

                it.only("(3) Registration: should returnt badPassword [too short]", function() {
                    assert.equal("badPassword", serverHandler({
                        "action": "register",
                        "login": "123Ivan",
                       "password": "123"
                    }));
                });

                it.only("(4) Registration: should returnt badPassword [too long]", function() {
                    assert.equal("badPassword", serverHandler({
                        "action": "register",
                        "login": "00Ivan00",
                        "password": "0123456789012345678901234567890123456789"
                    }));
                });

                it.only("(5) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "  ", 
                        "password": "0123456"
                    }));
                });

                it.only("(6) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "Иван", 
                        "password": "0123456"
                    }));
                });

                it.only("(7) Registration: should returnt badLogin [too short]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "A", 
                        "password": "0123456"
                    }));
                });

                it.only("(8) Registration: should returnt badLogin [too long]", function() {
                    assert.equal("badLogin", serverHandler({
                        "action": "register",
                        "login": "AaaaaBbbbbCccccDddddEeeeeFffffGggggHhhhh", 
                        "password": "0123456"
                    }));
                });

                it.only("(9) Registration: should returnt loginExists", function() {
                    assert.equal("loginExists", serverHandler({
                        "action": "register",
                        "login": "IvanPes",
                        "password": "123456"
                    }));
                });

                it.only("(10) Login: should returnt ok", function() {
                    assert.equal("ok", serverHandler({
                        "action": "login",
                        "login": "IvanPes",
                        "password": "123456"
                    }));
                });

                it.only("(11) Login: should returnt invalidCredentials [login does not exist]", function() {
                    assert.equal("invalidCredentials", serverHandler({
                        "action": "login",
                        "login": "Unknown",
                        "password": "123456"
                    }));
                });

                it.only("(12) Login: should returnt invalidCredentials [incorrect password]", function() {
                    assert.equal("invalidCredentials", serverHandler({
                        "action": "login",
                        "login": "IvanPes",
                        "password": "Mumbo-jumbo"
                    }));
                });
            });

            var runner = mocha.run();
            clearDB();
        }
    }
    
});