define([
  'jquery',
  'lib/chai',
  'utils/utils',
  'utils/socket',
  'test/items'

], function ($, chai, utils, ws, it_) {
  var socket;
  var userData;
  var consts = {};
  var defaultDamage = '3d2';

  function testProjectile() {
    utils.serverHandler({
      'action': 'register',
      'login': 'testPlayers',
      'password': 'testPlayers'
    });

    userData = utils.serverHandler({
      'action': 'login',
      'login': 'testPlayers',
      'password': 'testPlayers'
    });

    consts = {
      'action': 'setUpConst',
      'playerVelocity': 0.15,
      'slideThreshold': 0.23,
      'ticksPerSecond': 60,
      'screenRowCount': 4,
      'screenColumnCount': 3,
      'pickUpRadius': 3,
      'sid': userData.sid
    };

    onopen = function () {
      socket.startTesting(userData.sid);
    };

    onmessage = function (e) {
      var data = JSON.parse(e.data);
      if (data.action === 'startTesting' && data.result === 'ok') {
        test();
      }
    };
    socket = ws.WSConnect(userData.webSocket, onopen, onmessage);
  }

  function runBeforeEach(done) {
    console.log('running afterEach function...');
    setTimeout(done, 1000);
  }

  function test() {
    var assert = chai.assert;

    describe('Attack Player', function () {
      beforeEach(runBeforeEach);

      it('player should fail attack projectile in wall', function (done) {
        var player = {
          'x': 1.5,
          'y': 1.5,
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'slots': {},
          'inventory': []
        };
        var map = [
          [
            '#',
            '#',
            '#'
          ],
          [
            '#',
            '.',
            '#'
          ],
          [
            '#',
            '#',
            '#'
          ]
        ];
        var count = 0;
        this.timeout(10000);

        socket.setOnMessage(function (e) {
          var data = JSON.parse(e.data);
          console.log(e.data);

          switch (data.action) {
          case 'setUpMap':
            assert.equal('ok', data.result, 'load map');
            socket.putPlayer(player.x, player.y, player.stats, player.inventory, player.slots, userData.sid);
            break;

          case 'putPlayer':
            assert.equal('ok', data.result, 'put player');
            player.id = data.id;
            player.sid = data.sid;
            player.fistId = data.fistId;
            socket.useSkill(player.sid, 0.5, 0.5);
            socket.look(player.sid);
            // case "useSkill":
            //   assert.equal("ok", data.result, "useSkill request")
            //   socket.look(player.sid)
            break;

          case 'look':
            if (count === 0) {
              count++;
              socket.look(player.sid);

            } else {
              var actor = data.actors;
              for (var i = 0; i < actor.length; i++) {
                assert.notEqual(i.type, 'projectile', ' projectile');
              }
              socket.setOnMessage(undefined);
              done();
            }
          }
        });

        socket.setUpMap({
          'action': 'setUpMap',
          'map': map,
          'sid': userData.sid
        });

      });

      it('player should attack projectile mob ', function (done) {
        var flag = true;
        var mob = {
          'x': 1.5,
          'y': 1.5,
          'race': 'TROLL',
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'flags': [],
          'inventory': []
        };
        var player = {
          'x': 3.5,
          'y': 1.5,
          'stats': {
            'HP': 1000,
            'MAX_HP': 1000
          },
          'slots': {},
          'inventory': []
        };
        var map = [
          [
            '.',
            '.',
            '.',
            '.',
            '.'
          ],
          [
            '#',
            '.',
            '.',
            '.',
            '#'
          ],
          [
            '.',
            '.',
            '.',
            '.',
            '.'
          ]
        ];
        this.timeout(10000);

        socket.setOnMessage(function (e) {
          console.log(JSON.parse(e.data));
          var data = JSON.parse(e.data);

          switch (data.action) {
          case 'setUpMap':
            assert.equal('ok', data.result, 'load map');
            socket.putMob(mob.x, mob.y, mob.stats, mob.inventory, mob.flags, mob.race, defaultDamage, userData.sid);
            break;

          case 'putMob':
            assert.equal('ok', data.result, 'put mob');
            mob.id = data.id;
            socket.putPlayer(player.x, player.y, player.stats, player.inventory, player.slots, userData.sid);
            break;

          case 'putPlayer':
            assert.equal('ok', data.result, 'put player');
            player.id = data.id;
            player.sid = data.sid;
            player.fistId = data.fistId;
            socket.useSkill(player.sid, mob.x, mob.y);
            socket.look(player.sid);

            setTimeout(function () {
              socket.singleExamine(mob.id, userData.sid);
            }, 2000);
            break;

          //case "useSkill":
          //    assert.equal("ok", data.result, "useSkill fists")
          //   setTimeout(function() {socket.singleExamine(mob.id, userData.sid)}, 2000)   
          //   break
          case 'examine':
            if (data.type === 'player') {
              flag = false;
              assert.equal('ok', data.result, 'player: examine request');
              // assert.equal(player.stats.HP, data.health, "player: health has changed")
              socket.setOnMessage(undefined);
              done();

            } else if (data.type === 'monster') {
              assert.equal('ok', data.result, 'mob: examine request');
              assert.notEqual(mob.stats.HP, data.health, 'mob: health has changed');

              setTimeout(function () {
                socket.singleExamine(player.id, player.sid);
              }, 2000);
            }
            break;

          }
        });

        socket.setUpMap({
          'action': 'setUpMap',
          'map': map,
          'sid': userData.sid
        });

      });

      it('player should attack projectile mob', function (done) {
        var flag = true;
        var mob = {
          'x': 0.5,
          'y': 1.5,
          'race': 'TROLL',
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'flags': [],
          'inventory': []
        };
        var player = {
          'x': 9.5,
          'y': 1.5,
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'slots': {},
          'inventory': []
        };
        var map = [
          [
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.'
          ],
          [
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.'
          ],
          [
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.',
            '.'
          ]
        ];
        this.timeout(10000);

        socket.setOnMessage(function (e) {
          console.log(JSON.parse(e.data));
          var data = JSON.parse(e.data);

          switch (data.action) {
          case 'setUpMap':
            assert.equal('ok', data.result, 'load map');
            socket.putMob(mob.x, mob.y, mob.stats, mob.inventory, mob.flags, mob.race, defaultDamage, userData.sid);
            break;

          case 'putMob':
            assert.equal('ok', data.result, 'put mob');
            mob.id = data.id;
            socket.putPlayer(player.x, player.y, player.stats, player.inventory, player.slots, userData.sid);
            break;

          case 'putPlayer':
            assert.equal('ok', data.result, 'put player');
            player.id = data.id;
            player.sid = data.sid;
            player.fistId = data.fistId;
            socket.useSkill(player.sid, mob.x, mob.y);

            setTimeout(function () {
              socket.singleExamine(mob.id, userData.sid);
            }, 5000);
            break;

          //case "useSkill":
          //    assert.equal("ok", data.result, "useSkill fists")
          //    setTimeout(function() {socket.singleExamine(mob.id, userData.sid)}, 5000)   
          //    break
          case 'examine':
            if (data.type === 'player') {
              flag = false;
              assert.equal('ok', data.result, 'player: examine request');
              // assert.equal(player.stats.HP, data.health, "player: health has changed")
              socket.setOnMessage(undefined);
              done();

            } else if (data.type === 'monster') {
              assert.equal('ok', data.result, 'mob: examine request');
              assert.notEqual(mob.stats.HP, data.health, 'mob: health has changed');

              setTimeout(function () {
                socket.singleExamine(player.id, player.sid);
              }, 2000);
            }
            break;

          }
        });

        socket.setUpMap({
          'action': 'setUpMap',
          'map': map,
          'sid': userData.sid
        });

      });

      it('player should attack projectile mob', function (done) {
        var flag = true;
        var mob1 = {
          'x': 0.5,
          'y': 0.5,
          'race': 'TROLL',
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'flags': [],
          'inventory': []
        };
        var mob2 = {
          'x': 1.9,
          'y': 0.5,
          'race': 'TROLL',
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'flags': [],
          'inventory': []
        };
        var player = {
          'x': 1.5,
          'y': 1.5,
          'stats': {
            'HP': 100,
            'MAX_HP': 100
          },
          'slots': {},
          'inventory': []
        };
        var map = [
          [
            '.',
            '.',
            '.',
            '.'
          ],
          [
            '.',
            '.',
            '.',
            '.'
          ],
          [
            '.',
            '.',
            '.',
            '.'
          ]
        ];
        var count = 0;
        this.timeout(10000);

        socket.setOnMessage(function (e) {
          console.log(JSON.parse(e.data));
          var data = JSON.parse(e.data);

          switch (data.action) {
          case 'setUpMap':
            assert.equal('ok', data.result, 'load map');
            socket.putMob(mob1.x, mob1.y, mob1.stats, mob1.inventory, mob1.flags, mob1.race, defaultDamage, userData.sid);
            break;

          case 'putMob':
            assert.equal('ok', data.result, 'put mob');
            if (count++ === 0) {
              mob1.id = data.id;
              socket.putMob(mob2.x, mob2.y, mob2.stats, mob2.inventory, mob2.flags, mob2.race, defaultDamage, userData.sid);

            } else {
              count = 0;
              mob2.id = data.id;
              socket.putPlayer(player.x, player.y, player.stats, player.inventory, player.slots, userData.sid);
            }
            break;

          case 'putPlayer':
            assert.equal('ok', data.result, 'put player');
            player.id = data.id;
            player.sid = data.sid;
            player.fistId = data.fistId;
            socket.useSkill(player.sid, 1.2, 0.5);
            //   break
            // case "useSkill":
            //     assert.equal("ok", data.result, "useSkill fists")

            setTimeout(function () {
              socket.singleExamine(mob1.id, userData.sid);
            }, 5000);
            break;

          case 'examine':
            if (data.type === 'player') {
              flag = false;
              assert.equal('ok', data.result, 'player: examine request');
              //assert.equal(player.stats.HP, data.health, "player: health has changed")
              socket.setOnMessage(undefined);
              done();

            } else if (data.type === 'monster') {
              assert.equal('ok', data.result, 'mob: examine request');
              if (count++ === 0) {
                assert.notEqual(mob1.stats.HP, data.health, 'mob1: health has changed');

                setTimeout(function () {
                  socket.singleExamine(mob2.id, userData.sid);
                }, 1000);

              } else {
                assert.notEqual(mob2.stats.HP, data.health, 'mob2: health has changed');

                setTimeout(function () {
                  socket.singleExamine(player.id, player.sid);
                }, 2000);
              }
            }
            break;

          }
        });

        socket.setUpMap({
          'action': 'setUpMap',
          'map': map,
          'sid': userData.sid
        });

      });

    });

    after(function () {

      socket.setOnMessage(function (e) {
        var data = JSON.parse(e.data);
        if (data.action === 'stopTesting') {
          if (data.result === 'badAction') {
            $('#msg').text('Invalid action.').css('color', 'red');

          } else if (data.result === 'ok') {
            $('#msg').text('Test is successful.').css('color', 'green');
          }
        }
      });

      socket.stopTesting(userData.sid)  //socket.setOnMessage(undefined)
;
    });

    mocha.run();
  }

  function shift(dir, x_, y_, val) {
    var x = x_;
    var y = y_;

    switch (dir) {
    case 'west':
      x -= val;
      break;

    case 'east':
      x += val;
      break;

    case 'north':
      y -= val;
      break;

    case 'south':
      y += val;
      break;

    }
    return {
      'x': x,
      'y': y
    };
  }
  return { run: testProjectile };
});
