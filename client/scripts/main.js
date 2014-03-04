require(['jquery', 'authorization', 'tests'], function($, auth, tests) {

    $("#register").click(function(){
        auth.json("register");
    });
    $("#login").click(function(){
        auth.json("login");
    });
    $("#test").click(function(){
        tests.runTests();
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