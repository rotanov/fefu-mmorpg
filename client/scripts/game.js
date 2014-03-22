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
    var walls = [];
    var player
    var actors = [];

    var currWallsPosition = null;

    var id_
    var sid_

    function Start(id, sid) {
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
        id_ = id
        sid_ = sid
    }

    function loadMapElem() {
        var data = ws.getDictionary().dictionary
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

        $.when(ws.look(sid_), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            walls = renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            actors = renderActors(lookData.actors)
            player = createPlayer(game.world.centerX, game.world.centerY)
        })
    }

    function onUpdate() {
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
            for (var key in walls) {
               walls[key].destroy();
            }
            walls.length = 0;
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            for (var key in actors) {
               actors[key].destroy();
            }
            actors.length = 0;
            renderActors(lookData.actors)
        });
    }
    
    function createWalls() {
        var wall = []
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 7; j++ ) {
                    wall[i*7+j] = game.add.sprite(i*stepX, j*stepY, 'wall');
                    wall[i*7+j].visible = false;         
            }
        }
        return wall
    } 
    
    function createPlayer(x, y) {
        var actor = game.add.sprite(x, y, "player")
        actor.anchor.setTo(0.5, 0.5);
        return actor
    }

    function renderWalls(map) {
         for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#") {
                     walls.push(game.add.sprite(i*stepX, j*stepY, 'wall'));
                     walls[walls.length - 1].enabled = true;
                }
            }
        }
        return walls
    }

    function renderActors(actor) {
        for (var i = 0; i < actor.length; i++) {
                actors[actor[i].id] = game.add.sprite (
                (gPlayerX - actor[i].x + 9*0,5 - 1.0) * stepX,
                (gPlayerY - actor[i].y + 7*0,5 - 2) * stepY,
                actor[i].type )
                actors[actor[i].id].enabled = true;
        }
        return actors
    }

    return {
        start: Start
    }

})