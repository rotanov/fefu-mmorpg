define(["phaser", "utils", "ws"],
function (phaser, utils, ws) {

    var game = null;
    var dictionary = null;

        

    function Start() { 
        // 640, 480
         game = new phaser.Game(1024, 600, phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update});
    }

    function requestDictionary() {
        return JSON.stringify( {
                 ".": "grass",
                 "#": "wall",
            });

    }

    function requestLook() {
        return JSON.stringify({"map":
                        [
                            ["#", "#", ".", "#", "#", "#"],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."]
                        ],
                "actors": [
                        {"type": "player",
                        "id": 1,
                        "x": 4,
                        "y": 2 }           
                ]        
            });
    }

    function requestLook1() {
        return JSON.stringify({"map":
                        [
                            ["#", "#", ".", "#", "#", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."]
                        ],
                "actors": [
                        {"type": "player",
                        "id": 1,
                        "x": 5,
                        "y": 2 }           
                ]        
            });
    }
    var dictionary;

    function DictionaryParser() {
        var data = JSON.parse(requestDictionary());
        if (data["."])
            game.load.image(data["."], 'assets/'+data["."]+'.png');
        if (data["#"])    
            game.load.image(data["#"], 'assets/'+data["#"]+'.png');
        dictionary = data;   
    }

    function preload() {
        DictionaryParser();
        game.load.image('player', 'assets/tank4.png');
    }

    function createPlayer(x, y) {
        var bet = game.add.sprite(x, y, 'player');
        bet.anchor.setTo(0.5, 0.5);
        bet.body.collideWorldBounds = true;
        bet.body.bounce.setTo(1, 1);
        bet.body.immovable = true
        return bet;
    }

    var player;
    var upKey;
    var downKey;
    var leftKey;
    var rightKey;
    var stepX = 171;
    var stepY = 160;
    var map_object;
    var object = new Array();
    var actors = new Array();

    function Render() { 
        var data = JSON.parse(requestLook());
        return data;
    }

    function Render_map(map) {
        var ans = new Array();
        for (var i = 0; i < map.length; i++)  {
            for (var j = 0; j < map[i].length; j++ ) {
                if (map[i][j] == "#"){
                    ans.push(game.add.sprite(j*stepY, i*stepX, 'wall'));
                    ans[ans.length-1].inputEnabled = true;
                }
            
            }
        }
        return ans;
    }

    function Render_actors(map) {
        var ans = new Array();
        for (var i = 0; i < map.length; i++)  { 
            var play = map[i];
            ans[play.id] = game.add.sprite(play.x*stepY, play.y*stepX, play.type);
        }
        return ans;
    }

    function create() {
        game.add.tileSprite(0, 0, 1024, 640, 'grass');
        var data = Render();
        map_object = data.map;
        object = Render_map(map_object);
        actors = Render_actors(data.actors);
        player = createPlayer(game.world.centerX, game.world.centerY);
        upKey = game.input.keyboard.addKey(phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(phaser.Keyboard.RIGHT);
    }

    function Update_map(map){
        var count = 0;
        for (var i = 0; i < map.length; i++)  {
            for (var j = 0; j < map[i].length; j++ ){
                if (map[i][j] == "#" && map_object[i][j] != "#"){
                    object.push(game.add.sprite(j*stepY, i*stepX, 'wall'));
                }
                else if (map[i][j] == "." && map_object[i][j] == "#"){
                    object[count].destroy(); 
                }
                else if (map[i][j] == "#" && map_object[i][j] == "#")
                    count++;
            }
        }
        map_object = map;
    }

    function Update_actors(map){
        for (var i = 0; i < map.length; i++)  { 
            var play = map[i];
            if (actors[play.id]){
                actors[play.id].x = play.x*stepY;
                actors[play.id].y = play.y*stepX;
            } else {
                actors[play.id] = game.add.sprite(play.x*stepY, play.y*stepX, play.type);
            }
        }
    }
                
    function update() {
        // Call this from outside when signal is recieved, not for every frame
        var data = JSON.parse(requestLook());
        Update_map(data.map);
        Update_actors(data.actors);
        if (upKey.isDown)
        {
               
            //if (Move(north).result == "ok") {
                player.y--;
            //} else  {
            
           // }
            
        }
        else if (downKey.isDown)
        {       
        
           // if (Move(south).result == "ok") {
                player.y++;
           // } else  {
                
           // }    
        }

        if (leftKey.isDown)
        {
           // if (Move(west).result == "ok") {
                player.x--;
           // } else  {
            
          //  }
        }
        else if (rightKey.isDown)
        {
           // if (Move(east).result == "ok") {
                player.x++;
          //  } else  {
            
          //  }
        }
        

    }

    return {
        start: Start
    };

});