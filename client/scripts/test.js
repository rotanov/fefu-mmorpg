define(["jquery", "mocha", "chai"], function($, m, chai) {
    
    function test(enterJson)
    {
        document.title = "test";
        return $.ajax({
            type: "post",
            dataType: "json", 
            url: "http://localhost:6543/index.html",
            data: JSON.stringify(enterJson),
            ContentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {},
            error: function (ajaxRequest, ajaxOptions, thrownError) {
                console.log(thrownError);  
            }
        }).responseText;
    };
	
    return {
        runTests: function()
        {
            mocha.setup("bdd");  
            var assert = chai.assert;
            var expect = chai.expect;
            var should = chai.should();
			
            var enterJson1 = {
                "action": "register",
                "login": "Ivan", 
                "password": "123456",
            };
			
            describe("Function join()", function() {
                it("(1) Registration: should returnt ok", function() {
					assert.equal("ok", JSON.parse(test(enterJson1)).result);
                })
            });

            var enterJson2 = {
                "action": "register",
                "login": "Ivan123", 
                "password": "123456",
            };
			
            describe("Function join()", function() {
                it("(2) Registration: should returnt ok", function() {
                    assert.equal("ok", JSON.parse(test(enterJson2)).result);
                })
            });

            var enterJson3 = {
                "action": "register",
                "login": "123Ivan", 
                "password": "123",
            };
			
            describe("Function join()", function() {
                it("(3) Registration: should returnt badPassword [too short]", function() {
                    assert.equal("badPassword", JSON.parse(test(enterJson3)).result);
                })
            });	

            var enterJson4 = {
                "action": "register",
                "login": "00Ivan00", 
                "password": "0123456789012345678901234567890123456789",
            };
			
            describe("Function join()", function() {
                it("(4) Registration: should returnt badPassword [too long]", function() {
                    assert.equal("badPassword", JSON.parse(test(enterJson4)).result);
                })
            });	

            var enterJson5 = {
                "action": "register",
                "login": "	", 
                "password": "0123456",
            };
			
            describe("Function join()", function() {
                it("(5) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", JSON.parse(test(enterJson5)).result);
                })
            }); 

            var enterJson6 = {
                "action": "register",
                "login": "Иван", 
                "password": "0123456",
            };
			
            describe("Function join()", function() {
                it("(6) Registration: should returnt badLogin [invalid characters]", function() {
                    assert.equal("badLogin", JSON.parse(test(enterJson6)).result);
                })
            });
			
            var enterJson7 = {
                "action": "register",
                "login": "A", 
                "password": "0123456",
            };
			
            describe("Function join()", function() {
                it("(7) Registration: should returnt badLogin [too short]", function() {
                    assert.equal("badLogin", JSON.parse(test(enterJson7)).result);
                })
            });
			
            var enterJson8 = {
                "action": "register",
                "login": "AaaaaBbbbbCccccDddddEeeeeFffffGggggHhhhh", 
                "password": "0123456",
            };
			
            describe("Function join()", function() {
                it("(8) Registration: should returnt badLogin [too long]", function() {
                    assert.equal("badLogin", JSON.parse(test(enterJson8)).result);
                })
            });
			
            var enterJson9 = {
                "action": "register",
                "login": "Ivan", 
                "password": "123456",
            };
			
            describe("Function join()", function() {
                it("(9) Registration: should returnt loginExists", function() {
                    assert.equal("loginExists", JSON.parse(test(enterJson9)).result);
                })
            });
			
            var runner = mocha.run();
	    }
	}
	
});