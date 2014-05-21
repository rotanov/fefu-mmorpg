define(["jquery"],
function ($) {

    var id_
    var sid_
    var tick
    var socket

    var dictionData
    var lookData
    var moveData
    var examineData
    var constData

    function startGame(id, sid, wsUri) {
        id_ = id
        sid_ = sid

        if (!window.WebSocket) {
            document.body.innerHTML = "WebSocket is not supported."
        }

        socket = new WebSocket(wsUri)

        socket.onopen = function() {
            console.log("Connection open.")
            dictionary(sid_)
        }

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data)
            // console.log("Data received: " + event.data)

            //Tick
            if (data.tick) {
                tick = data.tick

            //Examine
            } else if (data.action === "examine") {

                examineData = data
                if (data.result == "ok") {
                    //actor.init(data);
                }

            //Get Dictionary
            } else if (data.action == "getDictionary") {
                dictionData = data

            //Look
            } else if (data.action == "look") {
                lookData = data

            //Move
            } else if (data.action == "move") {
                moveData = data

            //GetConst
            } else if (data.action == "getConst") {
                constData = data
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

    function examine(id, sid) {
        socket.send(JSON.stringify({
            "action": "examine",
            "id": id,
            "sid": sid
        }))
    }

    function look(sid) {
        socket.send(JSON.stringify({
            "action": "look",
            "sid": sid
        }))
    }

    function move(direction, tick, sid) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": direction,
            "tick": tick,
            "sid": sid
        }))
    }

    function dictionary(sid) {
        socket.send(JSON.stringify({
            action: "getDictionary",
            "sid": sid
        }))
    }

    function logout(sid) {
        socket.send(JSON.stringify({
            "action": "logout",
            "sid": sid
        }))
    }
    
    function attack(arr, sid) {
        socket.send(JSON.stringify({
            "action": "attack",
            "target": arr,
            "sid": sid
        }))
    }
    
    function destroyItem(id, sid) {
        socket.send(JSON.stringify({
            "action": "destroyItem",
            "id": id,
            "sid": sid
        }))
    }
    
    function getConst() {
        socket.send(JSON.stringify({
            "action": "getConst"
        }))
    }

    function getLookData() {
        return lookData
    }

    function getMoveData() {
        return moveData
    }

    function getExamineData() {
        return examineData
    }

    function getDictionary() {
        return dictionData
    }

    function getTick() {
        return tick
    }

    function getConstData() {
        return constData
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
        examine: examine,
        dictionary: dictionary,
        logout: logout,
        getConst: getConst,
        timeout: timeout,
        startGame: startGame,
        quitGame: quitGame,
        getTick: getTick,
        getLookData: getLookData,
        getMoveData: getMoveData,
        getExamineData: getExamineData,
        getDictionary: getDictionary,
        getConstData: getConstData,
    }

})