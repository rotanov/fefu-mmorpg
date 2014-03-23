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
    var mapGlobal

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
        dictionary = data
    }

    function onPreload() {
        game.load.tilemap('map', 'assets/tilemap.json', null, phaser.Tilemap.TILED_JSON);
        loadMapElem()
        game.load.image("tileset", "assets/tileset.png")
        game.load.image("player", "assets/player.png")
    }

    function onCreate() {
        mapGlobal = game.add.tilemap('map');

        mapGlobal.addTilesetImage('tileset');
      
        var layer = mapGlobal.createLayer('Tile Layer 1');
        
        layer.resizeWorld();
        
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
        });
    }
    
    
    function coordinate(x,coord,g) {
        return ((x - coord-0.5) + g*0.5) * stepX;
    }  
    
    function createActors(actor) {
            actors[actor.id] = game.add.sprite (
                coordinate(gPlayerX,actor.x,7.0),
                coordinate(gPlayerY,actor.y,9.0),
                actor.type )
            actors[actor.id].enabled = true;
    }
    

    function renderWalls(map) {
         for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#") {
                   mapGlobal.replace(1, 3, j, i, 1, 1) 
                } else {
                   mapGlobal.replace(3, 1, j, i, 1, 1)
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