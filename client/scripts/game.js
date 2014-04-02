define(["phaser", "utils", "ws", "actor"],
function (phaser, utils, ws, actor) {

    var game = null

    var upKey
    var downKey
    var leftKey
    var rightKey
    
    var pressUp = 0
    var pressDown = 0
    var pressLeft = 0
    var pressRight = 0

    var step = 64
    var gPlayerX
    var gPlayerY

    var actors = []
    var id_actors = []


    var currWallsPosition = null

    var id_
    var sid_
    var mapGlobal
    var layer

    function Start(id, sid) {
        game = new phaser.Game(
            576, 448,
            phaser.CANVAS, 
            "",
            {
                preload: onPreload,
                create: onCreate,
                update: onUpdate
            }
        )
        id_ = id
        sid_ = sid
    }

    function loadMapElem() {
        var data = ws.getDictionary().dictionary
        if (data["."])
            game.load.image(data["."], "assets/" + data["."] + ".png")
        if (data["#"])
            game.load.image(data["#"], "assets/" + data["#"] + ".png")
    }

    function onPreload() {
        game.load.tilemap("map", "assets/tilemap.json", null, phaser.Tilemap.TILED_JSON);
        loadMapElem()
        game.load.image("tileset", "assets/tileset.png")
        game.load.image("player", "assets/player.png")
        game.load.image("monstr", "assets/monstr.png")
    }

    function onCreate() {
        mapGlobal = game.add.tilemap("map")
        mapGlobal.addTilesetImage("tileset")

        layer = mapGlobal.createLayer("back")
        layer.resizeWorld()
 
        upKey = game.input.keyboard.addKey(phaser.Keyboard.UP)
        downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN)
        leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT)
        rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT)
        
        $.when(ws.look(sid_), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            renderActors(lookData.actors)
        })
    }

    function onUpdate() {
        if (game.input.mousePointer.isDown) {
            var id = getActorID()
            if (id) {
                $.when(ws.examine(id, sid_), ws.timeout(200, ws.getExamineData))
                .done(function (examine, examineData) {
                    if (examineData.result == "ok") {
                        var gamer = actor.newActor(id)
                        gamer.init(examineData)
                        gamer.drawInf()
                    }
                })
            }
        }
        if (upKey.isDown) {
             ws.move("north", ws.getTick(), sid_)
        } else if (downKey.isDown) {
            ws.move("south", ws.getTick(), sid_)
        }

        if (leftKey.isDown) {
            ws.move("west", ws.getTick(), sid_)
        } else if (rightKey.isDown) {
            ws.move("east", ws.getTick(), sid_)
        }

        $.when(ws.look(sid_), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            renderActors(lookData.actors)
        })
    }

    function coordinate(x, coord, g) {
        return (-(x - coord) + g * 0.5 ) * step
    }

    function createActors(actor) {
        actors.push( game.add.sprite (
            coordinate(gPlayerX, actor.x, 9.0),
            coordinate(gPlayerY, actor.y, 7.0),
            actor.type
        ))
        actors[actors.length-1].name = actor.id
        actors[actors.length-1].inputEnabled = true
        actors[actors.length-1].anchor.setTo(0.5, 0.5)
        id_actors[actor.id] = actors.length-1;
    }

    function renderWalls(map) {
        for (var i = 0 ; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                    if (map[i][j] == "#") {
                        mapGlobal.replace(1, 3, j, i, 1, 1)

                    } else {
                        mapGlobal.replace(3, 1, j, i, 1, 1)
                    }
            }
        }
        layer._x = (gPlayerX*step) % 64 - 32
        layer._y = (gPlayerY*step) % 64 - 32
    }

    function renderActors(actor) {
        var vis = []
        for (var i = 0; i < actor.length; i++) {
            if (actors[id_actors[actor[i].id]]) {
                actors[id_actors[actor[i].id]].x = coordinate(gPlayerX, actor[i].x, 9.0)
                actors[id_actors[actor[i].id]].y = coordinate(gPlayerY, actor[i].y, 7.0)
            } else {
                createActors(actor[i])
            }
            vis[id_actors[actor[i].id]] = true
        }
        var k = actors.length
        var j = 0
        for (var i = 0; i < k; i++) {
            if (!vis[i]) {
                id_actors[actors[i-j].name] = -1;
                actors[i-j].destroy();
                actors.splice(i-j, 1);
                j++
            }
        }
    }

    function getActorID() {
        for (var i = 0; i < actors.length; i++) {
            if (phaser.Rectangle.contains(actors[i].body, game.input.x, game.input.y)){
                return actors[i].name
            }
        }
        return 0
    }

    return {
        start: Start
    }

})