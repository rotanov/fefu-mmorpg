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
    var gPlayerX  
    var gPlayerY  
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
            gPlayerX = data.x
            gPlayerY = data.y
            actors = renderActors(data.actors)
           // player = createPlayer(game.world.centerX, game.world.centerY)
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
            gPlayerX = data.x
            gPlayerY = data.y
            for(key in actors){
              actors[key].destroy();
            }
            actors = renderActors(data.actors)
        });
    }

    function createPlayer(x, y) {
        var actor = game.add.sprite(x, y, "player")
        //actor.anchor.setTo(0.5, 0.5);
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
    
    function addActor (x, y, type) {
        return game.add.sprite (
               x,
               y,
               type
        )
    
    }
    
    function renderActors(actors) {
        var result = new Array()
        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            result[actor.id] = addActor(
               (gPlayerX - actor.x + 9*0,5 - 1.0) * stepX,
               (gPlayerY - actor.y + 7*0,5 - 2) * stepY,
                actor.type
            )
        }
        return result
    }


    return {
        start: Start
    }

})