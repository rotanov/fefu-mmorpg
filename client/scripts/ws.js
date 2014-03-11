define(["jquery", "authorization"], function ($, auth) {

    var wsUri = "ws://localhost:6544";
    var id = null;
    var sid = auth.getSid();
    var tick = null;
    var soket = null;
    var dictionary;

    function Actor(id) {
        this.id = id;
        this.type = null;
        this.login = null;
        this.x = null;
        this.y = null;

        this.init = function(data) {
            this.type = data.type;
            this.login = data.login;
            this.x = data.x;
            this.y = data.y;
        };

        this.move = function(direction) {
            socket.send(JSON.stringify({
                "action": "move",
                "direction": direction,
                "tick": tick
            }));
        };
    }

    var actor = new Actor(id);

    function startGame() {

        if (!window.WebSocket) {
            document.body.innerHTML = "WebSocket is not supported.";
        }

        socket = new WebSocket(wsUri);

        socket.onopen = function() {
            console.log("Connection open.");
            socket.send(JSON.stringify({
                action: "examine", 
                id: actor.id
            }));
            socket.send(JSON.stringify({
                action: "getDictionary"
            }));
        }

        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log("Connection closed.");

            } else {
                console.log("Connection is lost.");
            }

            console.log("[Code: " + event.code + ", reason: " + event.reason +"]");
        }

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);

            console.log("Data received: " + data);

            //Tick
            if (data.tick) {
                tick = data.tick;

            //Examine
            } else if (data.result == "badSid") {
                console.log("Error: badSid.");

            } else if (data.result == "badId") {
                console.log("Error: badId");

            } else if (data.result == "ok") {
                actor.init(data);

            //Get Dictionary
            } else if (data.dictionary) {
                dictionary = data.dictionary;
            }

            //Look
            /*  map: [[...]]
                actors: [{...}, ...]
            */
        }

        socket.onerror = function(error) {
            console.log("Error detected: " + error.message);
        }

        document.onkeydown = function(event) {
            switch(event.keyCode) {
                //Left
                case 37:
                    actor.move("east");
                    console.log("left");
                    break;
                //Up
                case 38:
                    actor.move("north");
                    console.log("up");
                    break;
                //Right
                case 39:
                    actor.move("west");
                    console.log("right");
                    break;
                //Down
                case 40:
                    actor.move("south");
                    console.log("down")
                    break;
            };
        }
    }

    return {
        startGame: startGame
    };

});