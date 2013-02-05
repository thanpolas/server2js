module('ss.server2js 0.2 features', {
  setup: function(){
  },
  teardown: function() {
  }

});

test('Data can be defined before hooks', function() {
  expect( 5 );

  stop();

  var s = ss.server.Server2jsClass();

  s(getParams());

  function multiplier(data) {
    strictEqual(data, 10, 'numeric value hook');
  }
  function writeOutput(data) {
    strictEqual(true, data, 'boolean value hook');
  }
  function paintWorld(data) {
    equal(data.elementId, 'helloWorld', 'object containing string value hook key 1');
    equal(data.elementValue, ' World', 'object containing string value hook key 2');
  }
  function closingHookz(data) {
    equal(data.elementValue, '!', 'object containing string value hook key 3');
    start();
  }

  s.hook('multiplier', multiplier);
  s.hook('writeOutput', writeOutput);
  s.hook('paintWorld', paintWorld);
  s.hook('paintReadyExclamation', closingHookz, 1000);

});

test('Malicious code gets passed intact', function() {
  expect( 1 );

  stop();

  var s = ss.server.Server2jsClass();

  s(getParams());

  function malicious(data) {
    strictEqual(data, 'Hello^2 <script src=""></script>', 'malicious passes intact');
    start();
  }

  s.hook('malicious', malicious);

});
