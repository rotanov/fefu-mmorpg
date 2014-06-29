define(["phaser", "utils", "object", "new_game/socket", "new_game/monsters", "new_game/items"],
function (phaser, utils, object, sock, monsters, items) {

var game
var socket

var msg
var layer
var actors = []
var fpsText
var tempTiles
var mapGlobal = []

var upKey
var downKey
var leftKey
var rightKey
var zKey //attack
var aKey //+ click = pickUp

var width  = 9
var height = 7
var step   = 64
var route  = 1

var gPlayerX
var gPlayerY

var id_
var sid_
var tick_

var max_h = 0
var curr_h = 0
var health
var lifespan = 1

function initSocket(wsUri) {
    socket = sock.WSConnect(wsUri, OnMessage)
}

function OnMessage(e) {
    var data = JSON.parse(e.data);

    if (data.tick) {
        tick_ = data.tick
        for (var i = 0, l = data.events.length; i < l; ++i)
            if (data.events[i].attaker != id_) {
                curr_h -= data.events[i].dealtDamage
                updateHealth(curr_h, max_h)
            }
        if (curr_h < max_h) ++curr_h
    }

    switch(data.action) {
    case "examine":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
            break
        }
        object.showInf(data)
        if (data.id == id_) {
            curr_h = data.health
            max_h = data.maxHealth
            updateHealth(curr_h, max_h)
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

    case "destroyItem":
        break

    case "drop":
        break

    case "attack":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
        }
        break

    case "equip":
        break

    case "unequip":
        break

    case "pickUp":
        if (data.result != "ok") {
            utils.cryBabyCry(data.result)
            popItem()
        }
        break
    }
}

function Start(id, sid, h, w) {
    id_ = id
    sid_ = sid

    height = h
    width = w

    game = new phaser.Game(
        64 * w, 64 * h,
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
    zKey = game.input.keyboard.addKey(phaser.Keyboard.Z)
    aKey = game.input.keyboard.addKey(phaser.Keyboard.A)

    createActors(0)
    socket.look(sid_)
    socket.examine(id_, sid_)

    fpsText = game.add.text(37, 37, "test", {
        font: "30px Arial",
        fill: "#ff0044",
        align: "left"
    })

    health = game.add.text(game.world.centerX + 120, 55, "HEALTH: " + curr_h + "/" + max_h, {
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

function updateHealth(h, m) {
    health.setText("HEALTH: " + h + "/" + m);
    if (h <= 0) {
        for (var i = 0, l = actors.length; i < l; ++i) {
            actors[i].visible = false
        }
        msg.setText("GAME OVER")
        lifespan = 0
    }
}

function onUpdate() {
    fpsText.setText("FPS: " + game.time.fps)

    if (game.input.mousePointer.isDown) {
        var data = getObgect()
        if (data.id && lifespan) {
            if (aKey.isDown) {
                getItem(data)
            } else {
                socket.examine(data.id, sid_)
            }
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

    if (zKey.isDown && lifespan) {
        socket.attack([gPlayerX, gPlayerY], sid_)
    }

    if (lifespan) {
        socket.look(sid_)
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
        sprite.inputEnabled = true
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

    for (var i = 0, l = map.length; i < l; i++) {
        for (var j = 0, ll = map[i].length; j < ll; j++ ) {
            (map[i][j] == "#") ? setTile(i, j, 15) : setTile(i, j, 21)
        }
    }

    mapGlobal.paste(0, 0, tempTiles)
}

function renderActors(actor) {
    for (var i = 0, j = 0, l = actor.length; i < l; i++, j++) {
        if (j == actors[j].length) {
            createActors(actors[j].length / width * height)
        }
        actors[j].id = actor[i].id
        actors[j].name = actor[i].name
        actors[j].x = coordinate(gPlayerX, actor[i].x, width)
        actors[j].y = coordinate(gPlayerY, actor[i].y, height)
        actors[j].visible = true
        setProperties(actor[i], j)
    }
    for (var i = j, l = actors.length; i < l; i++) {
        actors[i].visible = false
    }
}

function getObgect() {
    for (var i = 0, l = actors.length; i < l; i++) {
        if (phaser.Rectangle.contains(actors[i].body, game.input.x, game.input.y)) {
            return actors[i]
        }
    }
    return 0
}

function setProperties(actor, idx) {
    switch (actor.type) {
    case "player":
        var frameIndex = (actor.id == id_) ? route : 1
        actors[idx].loadTexture("player", frameIndex)
        break
    case "monster":
        actors[idx].loadTexture("tileset_monster", monsters.getFrame(actor.mobType))
        break
    case "item":
        actors[idx].loadTexture("tileset_monster", items.getFrame(actor.name))
        break
    case "projectile":
        break
    }
}

function getItem(data) {
    socket.pickUp(data.id, sid_)
    pushItem({"id": data.id, "name": data.name})
}

function pushItem(data) {
    $("#items select#items")
    .append("<option value='" + data.id + "'>" + data.name + "</option>")
}

function popItem() {
    $("#items select#items option:last").remove()
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

$("#use").click(function() {
    var id = $("#items select#items").find(":selected").val()
    socket.use(id, sid_)
})

$("#destroyItem").click(function() {
    var id = $("#items select#items").find(":selected").val()
    $("#items select#items").find(":selected").remove()
    socket.destroyItem(id, sid_)
})

$("#drop").click(function(id, sid_) {
    var id = $("#items select#items").find(":selected").val()
    $("#items select#items").find(":selected").remove()
    socket.drop(id, sid_)
})

$("#ok").click(function() {
    $("#slots").hide()
    var id = $("#items select#items").find(":selected").val()
    var slot = $("input:radio[name=slot]:checked").val()
    if (slot != undefined) {
        socket.equip(id, sid_, slot)
    }
})

$("#close").click(function() {
    $("#slots").hide()
})

$("#reset").click(function() {
    $("input:radio[name=slot]").attr("checked", false); 
})

$("#equip").click(function() {
    $("#slots").show()
})

return {
    start: Start,
    initSocket: initSocket
}

})