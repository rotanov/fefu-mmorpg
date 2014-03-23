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
    var step = false

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
<<<<<<< HEAD
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < 9; j++ ) {
                         walls[i*9+j] = game.add.sprite(j*stepX, i*stepY, 'wall');
                         walls[i*9+j].visible = false;
                }
            }
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            renderActors(lookData.actors)
=======
            walls = renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
            actors = renderActors(lookData.actors)
            player = createPlayer(game.world.centerX, game.world.centerY)
>>>>>>> c810652eb14090780d495db2eb2fc1b783ee4f15
        })
    }

    function onUpdate() {
        if (upKey.isDown) {
            ws.move("north", ws.getTick(), sid_)
<<<<<<< HEAD
=======

>>>>>>> c810652eb14090780d495db2eb2fc1b783ee4f15
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
<<<<<<< HEAD
            renderWalls(lookData.map)
            gPlayerX = lookData.x
            gPlayerY = lookData.y
=======
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
>>>>>>> c810652eb14090780d495db2eb2fc1b783ee4f15
            renderActors(lookData.actors)
        });
    }
    
    
    function coordinate(x,coord,g) {
        return (x - coord + g*0.5-0.5) * stepX;
    }  
    
    function createActors(actor) {
            actors[actor.id] = game.add.sprite (
                coordinate(gPlayerX,actor.x,9),
                coordinate(gPlayerY,actor.y,7),
                actor.type )
            actors[actor.id].enabled = true;
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
<<<<<<< HEAD
                    walls[i*9+j].visible = true;
                } else {
                    walls[i*9+j].visible = false;
=======
                     walls.push(game.add.sprite(i*stepX, j*stepY, 'wall'));
                     walls[walls.length - 1].enabled = true;
>>>>>>> c810652eb14090780d495db2eb2fc1b783ee4f15
                }
            }
        }
    }
      
    
    function renderActors(actor) {
        var vis = []
        for (var i = 0; i < actor.length; i++) {
            if (actors[actor[i].id]) {
                actors[actor[i].id].x = coordinate(gPlayerX,actor[i].x,9)
                actors[actor[i].id].y = coordinate(gPlayerY,actor[i].y,7)
            } else {
                createActors(actor[i])
            }
            vis[actor[i].id] = true;
        }
        for (var key in actors) { 
            if (!vis[key]) {
                actors[key].destroy()
                actors.splice(actors.indexOf(key),1)
            }
            
        }
    }

    return {
        start: Start
    }

})