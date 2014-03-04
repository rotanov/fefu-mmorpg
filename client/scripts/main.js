require(["jquery", "authorization", "test"], function($, auth, test) {

    $("#register").click(function(){
        auth.json("register");
    });
    $("#login").click(function(){
        auth.json("login");
    });
    $("#test").click(function(){
        $("#formregister").hide();
        test.runTests();
    });
    $("#logout").click(function(){
        auth.Exit();
    });
	 $("#Ok").click(function()
	{
		var url = document.getElementById('href');
		window.location = url.value;
	})

});