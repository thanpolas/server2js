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
    strictEqual(data, true, 'boolean value hook');
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

test('server2js entry func should return boolean', function() {
  expect( 2 );
  var server2js = ss.server.Server2jsClass();
  var ret = server2js(fixtures.jsonEnc);
  equal('boolean', typeof ret, 'server2js should return boolean value');
  ok( ret, 'a true value should be returned for an operation well done');
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

test('Proper decoding of passed data', function() {
  expect( 2 );
  var server2js = ss.server.Server2jsClass();

  server2js(fixtures.jsonEnc);

  server2js.hook('scriptTag', function(data) {
    equal(data, '<script>eval("\'evil!\'");</script>', 'Checking script tag integrity');
  });
  server2js.hook('oddCase', function(data) {
    equal(data, 'a single \' quote to mark " and "" and "" a back \\ run', 'oddcase with various quotes');
  });
});


test('breaking string case should not throw an error', function() {
  var server2js = ss.server.Server2jsClass();
  expect( 1 );
  server2js( fixtures.breakingJSON );
  ok(true, 'no error thrown');
});

test('breaking string case should make server2js return false', function() {
  expect( 1 );
  var server2js = ss.server.Server2jsClass();
  var ret = server2js( fixtures.breakingJSON );
  strictEqual( false, ret, 'server2js should return false');
});

test('breaking operation should not throw an error', function() {
  var server2js = ss.server.Server2jsClass();
  expect( 1 );
  server2js( fixtures.breakingJSONitem );
  ok(true, 'no error thrown');
});

test('breaking operation should not affect the whole operation', function() {
  var server2js = ss.server.Server2jsClass();
  expect( 1 );
  var ret = server2js( fixtures.breakingJSONitem );
  strictEqual( true, ret, 'server2js should return true');
});

test('breaking operation should have a value of null', function() {
  var server2js = ss.server.Server2jsClass();
  stop();
  expect( 1 );
  server2js.hook('udo', function( data ) {
    strictEqual( null, data, 'data for breaking operation should be null');
    start();
  });

  server2js( fixtures.breakingJSONitem );
});
