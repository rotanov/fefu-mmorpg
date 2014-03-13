define(["phaser", "utils", "ws"],
function (phaser, utils, ws) {

    var game = null;
    var dictionary;

    var upKey;
    var downKey;
    var leftKey;
    var rightKey;

    var stepX = 171;
    var stepY = 160;

    var walls;
    var player;
    var actors;

    var currWallsPosition;

    function Start() { 
        // 640, 480
        game = new phaser.Game(
            1024, 600,
            phaser.AUTO,
            "",
            {
                preload: onPreload,
                create: onCreate,
                update: onUpdate
            }
        );
    }

    function loadMapElem() {
        var dic = ws.getDictionary();
        var data = JSON.parse(dic);
        if (data["."])
            game.load.image(data["."], "assets/" + data["."] + ".png");
        if (data["#"])
            game.load.image(data["#"], "assets/" + data["#"] + ".png");
        dictionary = data;
    }

    function onPreload() {
        loadMapElem();
        game.load.image("player", "assets/tank.png");
    }

    function onCreate() {
        game.add.tileSprite(0, 0, 1024, 640, "grass");
        $.when(ws.look(), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            var data = JSON.parse(lookData);
            currWallsPosition = data.map;
            walls = renderWalls(data.map);
            //actors = renderActors(data.actors);
            player = createPlayer(game.world.centerX, game.world.centerY);

            upKey = game.input.keyboard.addKey(phaser.Keyboard.UP);
            downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN);
            leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT);
            rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT);
        });

    }

    function onUpdate() {
        $.when(ws.look(), ws.timeout(200, ws.getLookData))
        .done(function (look, lookData) {
            var data = JSON.parse(lookData);
            updateWallsPosition([data.map]);
            //updateActorsPosition(data.actors);

            if (upKey.isDown)  {
                player.y--;

            } else if (downKey.isDown) {
                player.y++;
            }

            if (leftKey.isDown) {
                player.x--;

            } else if (rightKey.isDown) {
                player.x++;
            }
        });
    }

    function createPlayer(x, y) {
        var actor = game.add.sprite(x, y, "player");
        //actor.anchor.setTo(0.5, 0.5);
        //actor.body.collideWorldBounds = true;
        //actor.body.bounce.setTo(1, 1);
        //actor.body.immovable = true
        return actor;
    }

    function renderWalls(map) {
        var result = new Array();
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#") {
                    result.push(game.add.sprite(j*stepY, i*stepX, "wall"));
                }
            }
        }
        return result;
    }

    function renderActors(actors) {
        var result = new Array();
        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            result[actor.id] = game.add.sprite (
                actor.x * stepY,
                actor.y * stepX,
                actor.type
            );
        }
        return result;
    }

    function updateWallsPosition(map) {
        var count = 0;
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#" && currWallsPosition[i][j] != "#") {
                    walls.push(game.add.sprite(j*stepY, i*stepX, "wall"));

                } else if (map[i][j] == "." && currWallsPosition[i][j] == "#") {
                    walls[count].destroy();

                } else if (map[i][j] == "#" && currWallsPosition[i][j] == "#") {
                    count++;
                }
            }
        }
        currWallsPosition = map;
    }

    function updateActorsPosition(map) {
        for (var i = 0; i < map.length; i++) {
            var actor = map[i];
            if (actors[actor.id]) {
                actors[actor.id].x = actor.x * stepY;
                actors[actor.id].y = actor.y * stepX;

            } else {
                actors[actor.id] = game.add.sprite (
                    actor.x * stepY,
                    actor.y * stepX,
                    actor.type
                );
            }
        }
    }

    return {
        start: Start
    };

});