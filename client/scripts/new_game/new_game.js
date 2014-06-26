define(["phaser", "utils", "actor", "new_game/socket"],
function (phaser, utils, actor, sock) {

var game
var socket

var layer
var actors = []
var fpsText
var mapGlobal = []

var upKey
var downKey
var leftKey
var rightKey

var width  = 9
var height = 7
var step   = 64

var gPlayerX
var gPlayerY

var id_
var sid_
var tick_

function initSocket(wsUri) {
    socket = sock.WSConnect(wsUri, OnMessage)
}

function OnMessage(e) {
    var data = JSON.parse(e.data);

    if (data.tick_ ) {
        tick_ = data.tick
    }

    switch(data.action) {
    case "examine":
        if (data.result == "ok") {
            var gamer = actor.newActor(getActorID())
            gamer.init(data)
            gamer.drawInf()
        } else {
            utils.cryBabyCry(data.result)
        }
        break

    case "getDictionary":
        console.log("Data received: " + data)
        break

    case "look":
        if (data.result == "ok") {
            gPlayerX = data.x
            gPlayerY = data.y
            renderWalls(data.map)
            renderActors(data.actors)
        } else {
            utils.cryBabyCry(data.result)
        }
        break

    case "move":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
        }
        break

    case "getConst":
        if (data.result == "ok") {
            height = data.screenRowCount
            width  = data.screenColumnCount
        } else {
            utils.CryBabyCry(getConstData.result);
        }
        break

    case "destroyItem":
        break

    case "drop":
        break

    case "attack":
        break

    case "equip":
        break

    case "unequip":
        break

    case "pickUp":
        break
    }
}

function Start(id, sid) {
    id_ = id
    sid_ = sid

    socket.send(JSON.stringify({
        "action": "getConst"
    }))

    game = new phaser.Game(
        64 * width, 64 * height,
        phaser.CANVAS, 
        "",
        {
            preload: onPreload,
            create: onCreate,
            update: onUpdate,
            render: onRender
        }
    )
}

function onPreload() {
    game.load.tilemap("map", "assets/tilemap.json", null, phaser.Tilemap.TILED_JSON);
    game.load.image("tileset", "assets/tileset.png")
    game.load.spritesheet("tileset", "assets/tileset.png", 64, 64, 38)
    game.load.image("tileset_monster", "assets/tileset_monster.png")
    game.load.spritesheet("tileset_monster", "assets/tileset_monster.png", 64, 64, 1107)
}

function onCreate() {
    game.stage.backgroundColor = "#ffeebb"
    mapGlobal = game.add.tilemap("map")
    mapGlobal.addTilesetImage("tileset")
    mapGlobal.addTilesetImage("tileset_monster")
    layer = mapGlobal.createLayer("back")
    layer.resizeWorld()

    upKey = game.input.keyboard.addKey(phaser.Keyboard.UP)
    downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN)
    leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT)
    rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT)

    socket.send(JSON.stringify({
        "action": "look",
        "sid": sid_
    }))

    createActors(0)

    fpsText = game.add.text(37, 37, "test", {
        font: "65px Arial",
        fill: "#ff0044",
        align: "left"
    })
}

function onUpdate() {
    fpsText.setText("FPS: " + game.time.fps)

    if (game.input.mousePointer.isDown) {
        var id = getActorID()
        if (id) {
            socket.send(JSON.stringify({
                "action": "examine",
                "id": id,
                "sid": sid_
            }))
        }
    }
    if (upKey.isDown) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": "north",
            "tick": tick_,
            "sid": sid_
        }))
    } else if (downKey.isDown) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": "south",
            "tick": tick_,
            "sid": sid_
        }))
    }

    if (leftKey.isDown) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": "west",
            "tick": tick_,
            "sid": sid_
        }))
    } else if (rightKey.isDown) {
        socket.send(JSON.stringify({
            "action": "move",
            "direction": "east",
            "tick": tick_,
            "sid": sid_
        }))
    }

    socket.send(JSON.stringify({
        "action": "look",
        "sid": sid_
    }))
}

function coordinate(x, coord, g) {
    return (-(x - coord) + g * 0.5 ) * step
}

function createActors(start) {
    var frameIndex = 31
    var length = width * height * (start+1)
    for (var i = start; i < length; i++) {
        var sprite = game.add.sprite(
            coordinate(gPlayerX, 0, width),
            coordinate(gPlayerY, 0, height),
            "tileset",
            frameIndex)

        sprite.name = -1
        sprite.inputEnabled = true
        sprite.visible = false
        sprite.anchor.setTo(0.5, 0.5)
        actors.push(sprite)
    }
}

var tempTiles

function renderWalls(map) {
    layer._x = (gPlayerX * step) % 64 - 32
    layer._y = (gPlayerY * step) % 64 - 32
    tempTiles = mapGlobal.copy(0, 0, width, height)

    var setTile = function (i, j, value) {
        tempTiles[i * width + j + 1].index = value
    }

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#") {
                    setTile(i, j, 15)
                } else {
                    setTile(i, j, 21)
                }
        }
    }

    mapGlobal.paste(0, 0, tempTiles)
}

function renderActors(actor) {
    var j = 0
    for (var i = 0; i < actor.length; i++) {
        if (actor[i].id) {
            if (j == actors[j].length) {
                createActors(actors[j].length / width * height);
            }
            var frameIndex = 31
            actors[j].name = actor[i].id
            actors[j].visible = true
            if (actor[i].type == "monster") {
                frameIndex = 29
            }
            actors[j].loadTexture("tileset", frameIndex)
            actors[j].x = coordinate(gPlayerX, actor[i].x, width)
            actors[j].y = coordinate(gPlayerY, actor[i].y, height) 
            j++
        }
    }

    var k = actors.length
    for (var i = j; i < k; i++) {
        actors[i].visible = false
    }
}

function getActorID() {
    for (var i = 0; i < actors.length; i++) {
        if (phaser.Rectangle.contains(actors[i].body, game.input.x, game.input.y)) {
            return actors[i].name
        }
    }
    return 0
}

var rectTop = new phaser.Rectangle(0, 0, 64 * width, 32)
var rectBottom = new phaser.Rectangle(0, 64 * height - 32, 64 * width, 32)
var rectLeft = new phaser.Rectangle(0, 0, 32, 64 * height)
var rectRight = new phaser.Rectangle(64 * width - 32, 0, 32, 64 * height)

function onRender() {
    var whiteColor = "rgba(255, 255, 255, 1)"
    game.debug.renderRectangle(rectTop, whiteColor)
    game.debug.renderRectangle(rectBottom, whiteColor)
    game.debug.renderRectangle(rectLeft, whiteColor)
    game.debug.renderRectangle(rectRight, whiteColor)
}

$("#logout").click(function() {
    game.destroy()
})

return {
    start: Start,
    initSocket: initSocket
}

})