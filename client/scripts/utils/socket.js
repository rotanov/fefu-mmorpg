define(function() {

    function Socket(wsuri, onopen, onmessage) {
        this.sock = new WebSocket(wsuri)
        this.sock.onmessage = onmessage
        this.sock.onopen = onopen
        this.sock.onclose = function(event) {
            if (event.wasClean) {
                console.log("Connection closed.")
            } else {
                console.log("Connection is lost.")
            }
            console.log("[Code: " + event.code + ", reason: " + event.reason +"]")
        }

    }

    Socket.prototype.setOnMessage = function(func) {
        this.sock.onmessage = func
    }

    /*Game Interaction*/

    Socket.prototype.singleExamine = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "examine",
            "id": parseInt(id),
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

    Socket.prototype.destroyItem = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "destroyItem",
            "id": parseInt(id),
            "sid": sid
        }))
    }

    Socket.prototype.drop = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "drop",
            "id": parseInt(id),
            "sid": sid
        }))
    }

    Socket.prototype.equip = function(id, sid, slot) {
        this.sock.send(JSON.stringify({
            "action": "equip",
            "id": parseInt(id),
            "sid": sid,
            "slot": slot
        }))
    }

    Socket.prototype.unequip = function(slot, sid) {
        this.sock.send(JSON.stringify({
            "action": "unequip",
            "slot": slot,
            "sid": sid
        }))
    }

    Socket.prototype.pickUp = function(id, sid) {
        this.sock.send(JSON.stringify({
            "action": "pickUp",
            "id": parseInt(id),
            "sid": sid
        }))
    }

    Socket.prototype.use = function(id, sid, x, y) {
        var request = {
            "action": "use",
            "id": parseInt(id),
            "sid": sid
        }
        if (x && y) {
            request["x"] = x
            request["y"] = y
        }
        this.sock.send(JSON.stringify(request))
    }

    Socket.prototype.useSkill = function(id, sid, x, y) {
        console.log("useSkill")
        var request = {
            "action": "useSkill",
            "id": parseInt(id),
            "sid": sid,
            "x": x,
            "y": y
        }
        this.sock.send(JSON.stringify(request))
    }

    /*Testing*/

    Socket.prototype.startTesting = function(sid) {
        this.sock.send(JSON.stringify({
            "action": "startTesting",
            "sid": sid
        }))
    }

    Socket.prototype.stopTesting = function(sid) {
        this.sock.send(JSON.stringify({
            "action": "stopTesting",
            "sid": sid
        }))
    }

    Socket.prototype.getDictionary = function(sid) {
        this.sock.send(JSON.stringify({
            action: "getDictionary",
            "sid": sid
        }))
    }

    Socket.prototype.setUpMap = function(data) {
        this.sock.send(JSON.stringify(data))
    }

    Socket.prototype.getConst = function(sid) {
        this.sock.send(JSON.stringify({
            "action": "getConst",
            "sid": sid
        }))
    }

    Socket.prototype.setUpConst = function(data) {
        this.sock.send(JSON.stringify(data))
    }

    Socket.prototype.putItem = function(x, y, item, sid) {
        this.sock.send(JSON.stringify({
            "action": "putItem",
            "x": x,
            "y": y,
            "item": item,
            "sid": sid
        }))
    }

    Socket.prototype.putMob = function(x, y, stats, inventory, flags, race, dealtDamage, sid) {
        this.sock.send(JSON.stringify({
            "action": "putMob",
            "x": x,
            "y": y,
            "stats": stats,
            "inventory": inventory,
            "flags": flags,
            "race": race,
            "dealtDamage": dealtDamage,
            "sid": sid
        }))
    }

    Socket.prototype.putPlayer = function(x, y, stats, inventory, slots, sid) {
        this.sock.send(JSON.stringify({
            "action": "putPlayer",
            "x": x,
            "y": y,
            "stats": stats,
            "inventory": inventory,
            "slots": slots,
            "sid": sid
        }))
    }

    Socket.prototype.enforce = function(object, sid) {
        this.sock.send(JSON.stringify({
            "action": "enforce",
            "enforcedAction": object,
            "sid": sid
        }))
    }

    function WSConnect(wsuri, onopen, onmessage) {
        return new Socket(wsuri, onopen, onmessage)
   }

    return {
        WSConnect: WSConnect
    }
})