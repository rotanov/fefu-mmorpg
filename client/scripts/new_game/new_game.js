define(["phaser", "utils", "object", "new_game/socket", "new_game/monsters"],
function (phaser, utils, object, sock, monsters) {

var game
var socket

var msg
var layer
var actors = []
var fpsText
var tempTiles
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

var health
var lifespan = 1

function initSocket(wsUri) {
    socket = sock.WSConnect(wsUri, OnMessage)
}

function OnMessage(e) {
    var data = JSON.parse(e.data);

    if (data.tick) {
        tick_ = data.tick
        if (data.events) {
            
        }
    }

    switch(data.action) {
    case "examine":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
            break
        }
        var obj = object.newObject(data)
        obj.drawInf()
        if (data.id == id_) {
            updateHealth(data)
        }
        break

    case "getDictionary":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
        }
        break

    case "look":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
            break
        }
        gPlayerX = data.x
        gPlayerY = data.y
        renderWalls(data.map)
        renderActors(data.actors)
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
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
        }
        socket.examine(id_, sid_)
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
        font: "30px Arial",
        fill: "#ff0044",
        align: "left"
    })

    health = game.add.text(game.world.centerX + 120, 55, "HEALTH: 100/100", {
        font: "30px Arial",
        fill: "#ff0044",
        align: "right"
    })

    health.anchor.setTo(0.5, 0.5)

    msg = game.add.text(32, 380, "", {
        font: "30pt Courier",
        fill: "#19cb65",
        stroke: "#119f4e",
        strokeThickness: 2
    })
}

function updateHealth(data) {
    health.setText("HEALTH: " + data.health + "/" + data.maxHealth);
    if (data.health <= 0) {
        var k = actors.length
        for (var i = 0; i < k; i++) {
            actors[i].visible = false
        }
        msg.setText("GAME OVER")
        lifespan = 0
    }
}

function onUpdate() {
    fpsText.setText("FPS: " + game.time.fps)

    if (game.input.mousePointer.isDown) {
        var id = getActorID()
        if (id && lifespan) {
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

    if (lifespan) {
        socket.look(sid_)
    }

    if (zKey.isDown) {
        var x, y
        switch(route) {
        case 3:
            x = gPlayerX
            y = gPlayerY //+ step
            break
        case 1:
            x = gPlayerX
            y = gPlayerY // - step
            break
        case 9:
            x = gPlayerX //+ step
            y = gPlayerY
            break
        case 11:
            x = gPlayerX //- step
            y = gPlayerY
            break
        }

        if (lifespan) {
            socket.attack([x, y], sid_)
        }
    }
}

function coordinate(x, coord, g) {
    return (-(x - coord) + g * 0.5 ) * step
}

function createActors(start) {
    var frameIndex = 31
    var length = width * height * (start+1)
    for (var i = start; i < length; i++) {
        var x = coordinate(gPlayerX, 0, width)
        var y = coordinate(gPlayerY, 0, height)
        var sprite = game.add.sprite(x, y, "tileset", frameIndex)
        sprite.anchor.setTo(0.5, 0.5)
        actors.push(sprite)
    }
}

function renderWalls(map) {
    layer._x = (gPlayerX * step) % 64 - 32
    layer._y = (gPlayerY * step) % 64 - 32
    tempTiles = mapGlobal.copy(0, 0, width, height)

    var setTile = function (i, j, value) {
        tempTiles[i * width + j + 1].index = value
    }

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++ ) {
            (map[i][j] == "#") ? setTile(i, j, 15) : setTile(i, j, 21)
        }
    }

    mapGlobal.paste(0, 0, tempTiles)
}

function renderActors(actor) {
    for (var i = 0, j = 0; i < actor.length; i++, j++) {
        if (!actor[i].id) return
        if (j == actors[j].length) {
            createActors(actors[j].length / width * height)
        }
        actors[j].id = actor[i].id
        actors[j].x = coordinate(gPlayerX, actor[i].x, width)
        actors[j].y = coordinate(gPlayerY, actor[i].y, height)
        actors[j].visible = true
        setTexture(actor[i], j)
    }

    var k = actors.length
    for (var i = j; i < k; i++) {
        actors[i].visible = false
    }
}

function getActorID() {
    for (var i = 0; i < actors.length; i++) {
        if (phaser.Rectangle.contains(actors[i].body, game.input.x, game.input.y)) {
            return actors[i].id
        }
    }
    return 0
}

function setTexture(actor, idx) {
    switch (actor.type) {
    case "player":
        var frameIndex = (actor.id == id_) ? route : 1
        actors[idx].loadTexture("player", frameIndex)
        break
    case "monster":
        actors[idx].loadTexture("tileset_monster", name_monster[actor.mobType])
        break
    case "item":
        break
    case "projectile":
        break
    }
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