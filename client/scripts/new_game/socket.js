define(function() {

    function Socket(wsuri, onmessage) {
        this.sock = new WebSocket(wsuri)
        this.sock.onopen = function() {
            console.log("Connection open.")
        }
        this.sock.onclose = function(event) {
            if (event.wasClean) {
                console.log("Connection closed.")
            } else {
                console.log("Connection is lost.")
            }
            console.log("[Code: " + event.code + ", reason: " + event.reason +"]")
        }
        this.sock.onmessage = onmessage
    }

    /*Game Interaction*/

    Socket.prototype.singleExamine = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "examine",
            "id": id,
            "sid": sid
        }))
    }

    Socket.prototype.mapCellExamine = function(sid, x, y) {
        this.sock.send(JSON.stringify({
            "action": "examine",
            "sid": sid,
            "x": x,
            "y": y
        }))
    }

    Socket.prototype.multipleIdExamine = function(ids, sid) {
        this.sock.send(JSON.stringify({
            "action": "examine",
            "ids": ids,
            "sid": sid
        }))
    }

    Socket.prototype.look = function(sid) {
        this.sock.send(JSON.stringify({
            "action": "look",
            "sid": sid
        }))
    }

    Socket.prototype.move = function(direction, tick, sid) {
        this.sock.send(JSON.stringify({
            "action": "move",
            "direction": direction,
            "tick": tick,
            "sid": sid
        }))
    }

    Socket.prototype.getDictionary = function(sid) {
        this.sock.send(JSON.stringify({
            action: "getDictionary",
            "sid": sid
        }))
    }

    Socket.prototype.logout = function(sid) {
        this.sock.send(JSON.stringify({
            "action": "logout",
            "sid": sid
        }))
    }

    Socket.prototype.attack = function(arr, sid) {
        this.sock.send(JSON.stringify({
            "action": "attack",
            "target": arr,
            "sid": sid
        }))
    }

    Socket.prototype.destroyItem = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "destroyItem",
            "id": id,
            "sid": sid
        }))
    }

    Socket.prototype.drop = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "drop",
            "id": id,
            "sid": sid
        }))
    }

    Socket.prototype.equip = function(id, sid, slot) {
        this.sock.send(JSON.stringify({
            "action": "equip",
            "id": id,
            "sid": sid,
            "slot": slot
        }))
    }

    Socket.prototype.unequip = function(slot, sid) {
        this.sock.send(JSON.stringify({
            "action": "unequip",
            "slot": id,
            "sid": sid
        }))
    }

    Socket.prototype.pickUp = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "pickUp",
            "id": id,
            "sid": sid
        }))
    }

    Socket.prototype.use = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "use",
            "id": id,
            "sid": sid
        }))
    }

    Socket.prototype.getConst = function() {
        this.sock.send(JSON.stringify({
            "action": "getConst"
        }))
    }

    function WSConnect(wsuri, onmessage) {
        return new Socket(wsuri, onmessage)
   }

    return {
        WSConnect: WSConnect
    }
})