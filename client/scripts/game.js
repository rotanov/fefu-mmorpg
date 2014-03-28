define(["phaser", "utils", "ws"],
function (phaser, utils, ws) {

    var game = null

    var upKey
    var downKey
    var leftKey
    var rightKey
    
    var pressUp = false
    var pressDown = false
    var pressLeft = false
    var pressRight = false

    var step = 64
    var gPlayerX
    var gPlayerY
    var actors = []

    var currWallsPosition = null

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
    }

    function onPreload() {
        game.load.tilemap("map", "assets/tilemap.json", null, phaser.Tilemap.TILED_JSON);
        loadMapElem()
        game.load.image("tileset", "assets/tileset1.png")
        game.load.image("player", "assets/player.png")
        game.load.image("player", "assets/monstr.png")
    }

    function onCreate() {
        mapGlobal = game.add.tilemap("map")
        mapGlobal.addTilesetImage("tileset")

        var layer = mapGlobal.createLayer("Tile Layer 1")
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
        if (upKey.isDown) {
            if (pressDown){
                pressDown = false
            } else if (!pressLeft && !pressRight && !pressUp) {
                pressUp = true
            } else {
                pressLeft = pressRight = pressUp = false
                ws.move("north", ws.getTick(), sid_)
            }

        } else if (downKey.isDown) {
            if (pressUp){
                pressUp = false
            } else if (!pressLeft && !pressRight && !pressDown) {
                pressDown = true
            } else {
                pressLeft = pressRight = pressDown = false
                ws.move("south", ws.getTick(), sid_)
            }
        }

        if (leftKey.isDown) {
             if (pressRight){
                pressRight = false
            } else if (!pressDown && !pressUp && !pressLeft) {
                pressLeft = true
            } else {
                pressLeft = pressDown = pressUp = false
               ws.move("west", ws.getTick(), sid_)
            }

        } else if (rightKey.isDown) {
             if (pressLeft){
                pressLeft = false
            } else if (!pressDown && !pressUp && !pressRight) {
                pressRight = true
            } else {
                pressUp = pressDown = pressRight = false
                ws.move("east", ws.getTick(), sid_)
            }
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
        return (-Math.round(x - coord + 0.45) - 0.5 + g * 0.5 ) * step;
    }

    function createActors(actor) {
        actors[actor.id] = game.add.sprite (
            coordinate(gPlayerX, actor.x, 9.0),
            coordinate(gPlayerY, actor.y, 7.0),
            actor.type
        )
        actors[actor.id].enabled = true
    }

    function renderWalls(map) {
        for (var i = 0 ; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                /* if (pressUp) {
                    if (map[i][j] == "#") {
                        if (i > 0 && i < map.length-1) {
                            if (map[i-1][j] == "#" && map[i+1][j] == "#") {
                                mapGlobal.replace(10, 24, j, i-1, 1, 1) 
                                mapGlobal.replace(5, 24, j, i, 1, 1) 
                            } else {
                                mapGlobal.replace(5, 10, j, i, 1, 1)
                                mapGlobal.replace(3, 10, j, i, 1, 1)
                            }
                        } 
                    }else if (i == 0) {
                        if (map[i+1][j] == "#")
                            mapGlobal.replace(14, 7, j, i, 1, 1)
                    } else {
                        mapGlobal.replace(3, 26, j, i, 1, 1)
                        mapGlobal.replace(12, 28, j, i, 1, 1)
                        mapGlobal.replace(13, 29, j, i, 1, 1)
                    }
                
                } else if (pressDown) {
                    if (map[i][j] == "#") {
                        if (i > 0 && i < map.length-1) {
                            if (map[i-1][j] == "#" && map[i+1][j] == "#") {
                                mapGlobal.replace(11, 24, j, i+1, 1, 1) 
                                mapGlobal.replace(5, 24, j, i, 1, 1) 
                            } else {
                                mapGlobal.replace(5, 11, j, i, 1, 1)
                                mapGlobal.replace(3, 11, j, i, 1, 1)
                            }
                        } 
                    }else if (i == 0) {
                        if (map[i+1][j] == "#")
                            mapGlobal.replace(14, 7, j, i, 1, 1)
                    } else {
                        mapGlobal.replace(3, 26, j, i, 1, 1)
                        mapGlobal.replace(12, 28, j, i, 1, 1)
                        mapGlobal.replace(13, 29, j, i, 1, 1)
                    }
                
                } else if (pressUp) {
                    if (map[i][j] == "#") {
                        if (i > 0 && i < map.length-1) {
                            if (map[i-1][j] == "#" && map[i+1][j] == "#") {
                                mapGlobal.replace(10, 24, j, i-1, 1, 1) 
                                mapGlobal.replace(5, 24, j, i, 1, 1) 
                            } else {
                                mapGlobal.replace(5, 10, j, i, 1, 1)
                                mapGlobal.replace(3, 10, j, i, 1, 1)
                            }
                        } 
                    }else if (i == 0) {
                        if (map[i+1][j] == "#")
                            mapGlobal.replace(14, 7, j, i, 1, 1)
                    } else {
                        mapGlobal.replace(3, 26, j, i, 1, 1)
                        mapGlobal.replace(12, 28, j, i, 1, 1)
                        mapGlobal.replace(13, 29, j, i, 1, 1)
                    }
                
                }else if (pressUp) {
                    if (map[i][j] == "#") {
                        if (i > 0 && i < map.length-1) {
                            if (map[i-1][j] == "#" && map[i+1][j] == "#") {
                                mapGlobal.replace(10, 24, j, i-1, 1, 1) 
                                mapGlobal.replace(5, 24, j, i, 1, 1) 
                            } else {
                                mapGlobal.replace(5, 10, j, i, 1, 1)
                                mapGlobal.replace(3, 10, j, i, 1, 1)
                            }
                        } 
                    }else if (i == 0) {
                        if (map[i+1][j] == "#")
                            mapGlobal.replace(14, 7, j, i, 1, 1)
                    } else {
                        mapGlobal.replace(3, 26, j, i, 1, 1)
                        mapGlobal.replace(12, 28, j, i, 1, 1)
                        mapGlobal.replace(13, 29, j, i, 1, 1)
                    }
                
                } else {*/
                    if (map[i][j] == "#") {
                        mapGlobal.replace(3, 5, j, i, 1, 1)  
                        mapGlobal.replace(14, 7, j, i, 1, 1) 
                        mapGlobal.replace(17, 20, j, i, 1, 1) 
                        mapGlobal.replace(19, 23, j, i, 1, 1) 
                        mapGlobal.replace(15, 1, j, i, 1, 1)  
                        mapGlobal.replace(12, 6, j, i, 1, 1) 
                        mapGlobal.replace(13, 2, j, i, 1, 1) 
                        mapGlobal.replace(16, 22, j, i, 1, 1)  
                        mapGlobal.replace(18, 21, j, i, 1, 1) 
                        mapGlobal.replace(10, 5, j, i, 1, 1) 
                       /*  mapGlobal.replace(24, 5, j, i, 1, 1) 
                        mapGlobal.replace(11, 5, j, i, 1, 1)  
                        mapGlobal.replace(26, 5, j, i, 1, 1) 
                        mapGlobal.replace(28, 14, j, i, 1, 1)
                        mapGlobal.replace(28, 15, j, i, 1, 1) 
                        mapGlobal.replace(29, 14, j, i, 1, 1) */
                        //mapGlobal.replace(29, 15, j, i, 1, 1) 
                    } else {
                        mapGlobal.replace(5, 3, j, i, 1, 1)
                        mapGlobal.replace(7, 14, j, i, 1, 1) 
                        mapGlobal.replace(20, 17, j, i, 1, 1) 
                        mapGlobal.replace(23, 19, j, i, 1, 1) 
                        mapGlobal.replace(1, 15, j, i, 1, 1)  
                        mapGlobal.replace(6, 12, j, i, 1, 1) 
                        mapGlobal.replace(2, 13, j, i, 1, 1) 
                        mapGlobal.replace(22, 16, j, i, 1, 1)  
                        mapGlobal.replace(21, 18, j, i, 1, 1) 
                        mapGlobal.replace(10, 3, j, i, 1, 1) 
                       /*  mapGlobal.replace(24, 3, j, i, 1, 1)  
                        mapGlobal.replace(11, 3, j, i, 1, 1)  
                        mapGlobal.replace(26, 3, j, i, 1, 1) 
                        mapGlobal.replace(28, 12, j, i, 1, 1)
                        mapGlobal.replace(29, 13, j, i, 1, 1)  */
                   
                    }
                //}
            }
        }
    }

    function renderActors(actor) {
        var vis = []
        for (var i = 0; i < actor.length; i++) {
            if (actors[actor[i].id]) {
                actors[actor[i].id].x = coordinate(gPlayerX, actor[i].x, 9.0)
                actors[actor[i].id].y = coordinate(gPlayerY, actor[i].y, 7.0)
            } else {
                createActors(actor[i])
            }
            vis[actor[i].id] = true
        }
        for (var key in actors) {
            if (!vis[key]) {
                actors[key].destroy()
                actors.splice(actors.indexOf(key), 1)
            }
        }
    }

    return {
        start: Start
    }

})