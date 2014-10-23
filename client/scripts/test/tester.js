define([
  'lib/mocha',
  'test/register',
  'test/websocket',
  'test/items',
  'test/mobs',
  'test/players',
  'test/projectile'

], function (m, tr, tw, ti, tm, tp, tpro) {

  function runTestset(testsetName) {
    $('#mocha, #msg').empty();
    mocha.setup('bdd');

    ({'register': tr,
      'websocket': tw,
      'items': ti,
      'mobs': tm,
      'players': tp,
      'projectile': tpro
    })[testsetName].run();

  }
  return { runTestset: runTestset };
});
