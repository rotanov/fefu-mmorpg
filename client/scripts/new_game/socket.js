define(function() {
    function WSConnect(wsuri, onmessage) {
        if (!window.WebSocket) {
            document.body.innerHTML = "WebSocket is not supported."
            return
        }

        var socket = new WebSocket(wsuri)

        socket.onopen = function() {
            console.log("Connection open.")
        }

        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log("Connection closed.")
            } else {
                console.log("Connection is lost.")
            }
            console.log("[Code: " + event.code + ", reason: " + event.reason +"]")
        }
        socket.onmessage = onmessage
        return socket
   }

    return {
        WSConnect: WSConnect
    }
})