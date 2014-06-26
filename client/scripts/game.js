define(["phaser", "utils", "ws", "actor"],
function (phaser, utils, ws, actor) {

var game = null

var upKey
var downKey
var leftKey
var rightKey
var width = 9
var height = 7
var step = 64
var gPlayerX
var gPlayerY

var actors = []

var name_monster = []

name_monster["Scrawny cat"] = 83
name_monster["Scruffy little dog"] = 84
name_monster["Grey mold"] = 95
name_monster["Grey mushroom patch"] = 105 
name_monster["Giant yellow centipede"] = 111
name_monster["Giant white centipede"] = 112
name_monster["White icky thing"] = 113
name_monster["Large brown snake"] = 65
name_monster["Large white snake"] = 98
name_monster["Small kobold"] = 99
name_monster["Floating eye"] = 108
name_monster["Rock lizard"] = 200
name_monster["Soldier ant"] = 145
name_monster["Fruit bat"] = 128
name_monster["Kobold"] = 129
name_monster["Metallic green centipede"] = 189
name_monster["Yellow mushroom patch"] = 160
name_monster["White jelly"] = 161
name_monster["Giant green frog"] = 170
name_monster["Giant black ant"] = 155
name_monster["Salamander"] = 145
name_monster["Yellow mold"] = 133
name_monster["Metallic red centipede"] = 123
name_monster["Cave lizard"] = 124
name_monster["Blue jelly"] = 67
name_monster["Large grey snake"] = 190
name_monster["Raven"] = 127
name_monster["Blue ooze"] = 128
name_monster["Green glutton ghost"] = 229
name_monster["Green jelly"] = 130
name_monster["Large kobold"] = 211
name_monster["Skeleton kobold"] = 112
name_monster["Grey icky thing"] = 173

var id_
var sid_
var mapGlobal
var layer
var route = 1

var fpsText


function Start(id, sid) {
    if (ws.readyState === 1)
    $.when(ws.getConst(), ws.timeout(600, ws.getConstData))
         .done(function (constData) {
            if (constData.result == "ok") {
                height = constData.screenRowCount
                width  = constData.screenColumnCountelse
            }
        }) 
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
    id_ = id
    sid_ = sid
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
    
    $.when(ws.look(sid_), ws.timeout(400, ws.getLookData))
    .done(function (look, lookData) {
        if (lookData.result == "ok") {
            createActors(0) 
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            renderActors(lookData.actors)
        } else {
            utils.cryBabyCry(lookData.result)
        }
    })

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
            $.when(ws.examine(id, sid_), ws.timeout(400, ws.getExamineData))
            .done(function (examine, examineData) {
                if (examineData.result == "ok") {
                    var gamer = actor.newActor(id)
                    gamer.init(examineData)
                    gamer.drawInf()
                } else {
                    utils.cryBabyCry(examineData.result)
                }
            })
        }
    }
    if (upKey.isDown) {
        route = 3
        ws.move("north", ws.getTick(), sid_)
    } else if (downKey.isDown) {
        route = 1
        ws.move("south", ws.getTick(), sid_)
    }

    if (leftKey.isDown) {
        route = 9
        ws.move("west", ws.getTick(), sid_)
    } else if (rightKey.isDown) {
        route = 11
        ws.move("east", ws.getTick(), sid_)
    }

    $.when(ws.look(sid_), ws.timeout(200, ws.getLookData))
    .done(function (look, lookData) {
        if (lookData.result == "ok") {
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            renderWalls(lookData.map)
            renderActors(lookData.actors)
        } else {
            utils.cryBabyCry(lookData.result)
        }
    })
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
                monster(actor[i], j)//frameIndex = 29 name_monster[actor[i].type]
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
    start: Start
}

})