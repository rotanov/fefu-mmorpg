define(["jquery"],
function ($) {

    var id = 1
    var sid_ = null
    var tick = null
    var socket = null

    var dictionary
    var lookData

   /*  function Actor(id) {
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
                action: "move",
                direction: direction,
                tick: tick,
                sid: sid_
            }));
        };
    }

    var actor = new Actor(id); */

    function startGame(sid, wsUri) {

        sid_ = sid

        if (!window.WebSocket) {
            document.body.innerHTML = "WebSocket is not supported."
        }

        socket = new WebSocket(wsUri)

        socket.onopen = function() {
            console.log("Connection open.")

            socket.send(JSON.stringify({
                action: "getDictionary",
                "sid": sid_
            }))
        }

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data)

            console.log("Data received: " + event.data)

            //Tick
            if (data.tick) {
                tick = data.tick

            //Examine
            } else if (data.result == "badSid") {
                console.log("Error: badSid.")

            } else if (data.result == "badId") {
                console.log("Error: badId")

            /*} else if (data.result == "ok") {
                actor.init(data);*/

            //Get Dictionary
            } else if (data.dictionary) {
                dictionary = data.dictionary

            //Look
            } else if (data.map/* && data.actors*/) {
                lookData = data
            }
        }

        socket.onerror = function(error) {
            console.log("Error detected: " + error.message)
        }
    }

    function quitGame() {
        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log("Connection closed.")

            } else {
                console.log("Connection is lost.")
            }
            console.log("[Code: " + event.code + ", reason: " + event.reason +"]")
        }
    }

    function look() {
        socket.send(JSON.stringify({
            "action": "look",
            "id": 1,
            "sid": sid_
        }))
    }
    
    function move(direction) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": direction,
            "tick": tick,
            "sid": sid_
        }))
    }

    function logout() {
        socket.send(JSON.stringify({
            "action": "logout",
            "sid": sid_
        }))
    }

    function getLookData() {
        return JSON.stringify(lookData)
    }
  
    function getDictionary() {
        return JSON.stringify(dictionary)
    }

    function timeout(x, callback) {
        var dfd = $.Deferred()
        setTimeout(function () {
            dfd.resolve(callback())
        }, x)
        return dfd.promise()
    }

    return {
        look: look,
        move: move,
        logout: logout,
        timeout: timeout,
        startGame: startGame,
        quitGame: quitGame,
        getLookData: getLookData,
        getDictionary: getDictionary,
    }

})