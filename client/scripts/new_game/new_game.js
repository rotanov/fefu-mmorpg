define(["phaser", "utils", "actor", "new_game/socket", "new_game/monsters"],
function (phaser, utils, actor, sock, monsters) {

var game
var socket

var layer
var actors = []
var fpsText
var mapGlobal = []
var name_monster = []

var upKey
var downKey
var leftKey
var rightKey
var zKey

var width  = 9
var height = 7
var step   = 64
var route  = 1

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
    name_monster = monsters.getNames()

    socket.getConst()

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
    game.load.image("player", "assets/player.png")
    game.load.spritesheet("player", "assets/player.png", 64, 64, 16)
}

function onCreate() {
    game.stage.backgroundColor = "#ffeebb"
    mapGlobal = game.add.tilemap("map")
    mapGlobal.addTilesetImage("tileset")
    mapGlobal.addTilesetImage("tileset_monster")
    mapGlobal.addTilesetImage("player")
    layer = mapGlobal.createLayer("back")
    layer.resizeWorld()

    upKey = game.input.keyboard.addKey(phaser.Keyboard.UP)
    downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN)
    leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT)
    rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT)
    zKey = game.input.keyboard.addKey(phaser.Keyboard.Z);

    createActors(0)
    socket.look(sid_)

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
            socket.examine(id, sid_)
        }
    }
    if (upKey.isDown) {
        route = 3
        socket.move("north", tick_, sid_)
    } else if (downKey.isDown) {
        route = 1
        socket.move("south", tick_, sid_)
    }

    if (leftKey.isDown) {
        route = 9
        socket.move("west", tick_, sid_)
    } else if (rightKey.isDown) {
        route = 11
        socket.move("east", tick_, sid_)
    }

    socket.look(sid_)

    if (zKey.isDown) {
        var x, y
        switch(route) {
        case 3:
            x = gPlayerX
            y = gPlayerY + step
            break
        case 1:
            x = gPlayerX
            y = gPlayerY - step
            break
        case 9:
            x = gPlayerX + step
            y = gPlayerY
            break
        case 11:
            x = gPlayerX - step
            y = gPlayerY
            break
        }
        socket.attack([x, y], sid_)
    }
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

function monster(actor, j) {
    var frameIndex = name_monster[actor.mobType]
    actors[j].loadTexture("tileset_monster", frameIndex)
}

function player(actor, j) {
    var frameIndex = 1
    if (actor.id == id_) {
        frameIndex = route
    }
    actors[j].loadTexture("player", frameIndex)
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
                monster(actor[i], j)
            } else {
                player(actor[i], j)
            }
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