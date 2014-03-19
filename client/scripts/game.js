define(["phaser", "utils", "ws"],
function (phaser, utils, ws) {

    var game = null
    var dictionary

    var upKey
    var downKey
    var leftKey
    var rightKey

    var stepX = 64
    var stepY = 64
    var walls
    var player
    var actors

    var currWallsPosition

    function Start() {
        game = new phaser.Game(
            576, 448,
            phaser.AUTO,
            "",
            {
                preload: onPreload,
                create: onCreate,
                update: onUpdate
            }
        )
    }

    function loadMapElem() {
        var dic = ws.getDictionary()
        var data = JSON.parse(dic)
        if (data["."])
            game.load.image(data["."], "assets/" + data["."] + ".png")
        if (data["#"])
            game.load.image(data["#"], "assets/" + data["#"] + ".png")
        dictionary = data
    }

    function onPreload() {
        loadMapElem()
        game.load.image("player", "assets/player.png")
    }

    function onCreate() {
        game.add.tileSprite(0, 0, 576, 448, "grass")
        upKey = game.input.keyboard.addKey(phaser.Keyboard.UP)
        downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN)
        leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT)
        rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT)

        $.when(ws.look(), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            var data = JSON.parse(lookData)
            currWallsPosition = data.map
            walls = renderWalls(data.map)
            actors = renderActors(data.actors)
            player = createPlayer(game.world.centerX, game.world.centerY)
        })
    }

    function onUpdate() {
        if (upKey.isDown) {
            ws.move("north")

        } else if (downKey.isDown) {
            ws.move("south")
        }

        if (leftKey.isDown) {
            ws.move("west")

        } else if (rightKey.isDown) {
            ws.move("east")
        }

        $.when(ws.look(), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            var data = JSON.parse(lookData)
            walls.destroy()
            walls = renderWalls(data.map)
            updateActorsPosition(data.actors)
        });
    }

    function createPlayer(x, y) {
        var actor = game.add.sprite(x, y, "player")
        actor.anchor.setTo(0.5, 0.5);
        //actor.body.collideWorldBounds = true
        //actor.body.bounce.setTo(1, 1)
        //actor.body.immovable = true
        return actor
    }

    function renderWalls(map) {
        wall = game.add.group()
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#") {
                    wall.create(j*stepY, i*stepX, "wall")
                }
             }
        }
        return wall
    }

    function renderActors(actors) {
        var result = new Array()
        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            result[actor.id] = game.add.sprite (
                actor.x * stepY,
                actor.y * stepX,
                actor.type
            )
        }
        return result
    }

    function updateActorsPosition(map) {
        vis = new Array
        for (var i = 0; i < map.length; i++) {
            var actor = map[i]
            if (actors[actor.id]) {
                actors[actor.id].x = actor.x * stepY
                actors[actor.id].y = actor.y * stepX
                vis[actor.id] = true
            } else {
                actors[actor.id] = game.add.sprite (
                    actor.x * stepY,
                    actor.y * stepX,
                    actor.type
                )
                vis[actor.id] = true
            }
        }
        for (var i = 0; i < map.length; i++) { 
            var actor = map[i]
            if (!vis[actor.id])
                actors[actor.id].destroy()
        }
    }

    return {
        start: Start
    }

})