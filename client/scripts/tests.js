define(["jquery"], function($) {

    function test(enterJson, etalonJson)
    {
        /*alert (enterJson.login+' '+enterJson.password);*/
        document.title = "tests";
        $.ajax({
            type: "post",
            dataType: "json", 
            url: location.href,
            data: JSON.stringify(enterJson),
            ContentType: "application/json; charset=utf-8",
            success:  function (data){
                $("#formregister").hide();  
                /*alert (etalonJson.result+" "+data.result);*/
                if (etalonJson.result === data.result)  
                {
                    $("<div/>", {
                        html: "ok <br/>"
                    }).appendTo("#content");
                }
                else
                {
                    $("<div/>", {
                        html: "no <br/>"
                    }).appendTo("#content");
                }
            },
            error: function (ajaxRequest, ajaxOptions, thrownError) {
                console.log(thrownError);                   
            }
        });
    };

    function clearDB()
    {
        $.ajax({
            type: "post",
            dataType: "json", 
            url: location.href,
            data: JSON.stringify({"action": "clear"}),
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
            var enterJson, etalonJson;
            enterJson = {
                "action": "register",
                "login": "Apple", 
                "password": "123",
            };
            etalonJson = {
                "result": "ok"
            };
            test(enterJson, etalonJson);/*1*/
            
            etalonJson = {
                "result": "loginExists"
            };
            test(enterJson, etalonJson);/*2*/
            
            enterJson = {
                "action": "register",
                "login": "Яблоко", 
                "password": "123",
            };
            etalonJson = {
                "result": "badLogin"
            };
            test(enterJson, etalonJson);/*3*/
            
            enterJson = {
                "action": "register",
                "login": "Lemon", 
                "password": "",
            };
            etalonJson = {
                "result": "badPassword"
            };
            test(enterJson, etalonJson);/*4*/
            
            enterJson = {
                "action": "register",
                "login": "", 
                "password": "",
            };
            etalonJson = {
                "result": "badLogin"
            };
            test(enterJson, etalonJson);/*5*/
            
            enterJson = {
                "action": "login",
                "login": "Apple", 
                "password": "123",
            };
            etalonJson = {
                "result": "ok"
            };
            test(enterJson, etalonJson);/*6*/
            
            enterJson = {
                "action": "login",
                "login": "Apple", 
                "password": "",
            };
            etalonJson = {
                "result": "invalidCredentials"
            };
            test(enterJson, etalonJson);/*7*/
            
            enterJson = {
                "action": "login",
                "login": "Banana", 
                "password": "123",
            };
            etalonJson = {
                "result": "invalidCredentials"
            };
            test(enterJson, etalonJson);/*8*/
            
            clearDB();
        }
    }

});