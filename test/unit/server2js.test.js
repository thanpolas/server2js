goog.require('goog.string');

module('ss.server2js', {
  setup: function(){
  },
  teardown: function() {
  }
});


// Parameters fixture
var ParamsFixture = function()
{
  return [
    {
      op: 'paintWorld',
      val: {
        elementId: 'helloWorld',
        elementValue: ' World'
      }
    },
    {
      op: 'paintHello',
      val: {
        elementId: 'helloWorld',
        elementValue: 'Hello'
      }
    },
    {
      op: 'paintHello',
      val: {
        elementId: 'doubleHello',
        elementValue: 'Hello^2'
      }
    },
    {
      op: 'malicious',
      val: 'Hello^2 <script src=""></script>'
    },
    {
      op: 'writeOutput',
      val: true
    },
    {
      op: 'multiplier',
      val: 10
    },
    {
      op: 'paintReadyExclamation',
      val: {
        elementId: 'helloWorld',
        elementValue: '!'
      }
    },
    {
      op: 'fireWhenReady',
      val: [5,6,7]
    }
  ];
};

/**
 * Get the params fixture array in a JSON encoded string
 *
 * @return {string}
 */
var getParams = function()
{
  return encodeParams(new ParamsFixture());
};

var encodeParams = function(arrayData) {
  var fixture = arrayData,
      properFixture = [];
  for (var i = 0, len = fixture.length; i < len ; i++) {
    var val = JSON.stringify(fixture[i].val);
    val = goog.string.htmlEscape(val);
    properFixture.push({
      op: fixture[i].op,
      val: val
    });
  }
  return JSON.stringify(properFixture);
};


test('Core functionality', function() {
  expect( 5 );

  stop();

  var s = ss.server;

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
  s(getParams(), true);

});

test('Execution Priority and Ready event', function() {
  expect( 16 );

  stop();

  var server = ss.server.Server2jsClass();

  // priority tracker
  var sequence = 1;
  // ready fired
  var ready = false;

  function multiplier(data) {
    strictEqual(data, 10, 'numeric value hook');
    equal(sequence, 3, 'Our execution sequence should be 3');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function writeOutput(data) {
    console.log('WRITE TRUE TRUE TRUE');
    strictEqual(data, true, 'boolean value hook');
    equal(sequence, 1, 'Our execution sequence should be 1');
    ok(!ready, 'Ready should not be true');
    sequence++;
    console.log('\n\nWRITE seq seq', sequence);
  }

  function paintWorld(data) {
    console.log('\n\n paintWorld seq', sequence);
    equal(data.elementId, 'helloWorld', 'object containing string value hook key 1');
    equal(data.elementValue, ' World', 'object containing string value hook key 2');
    equal(sequence, 2, 'Our execution sequence should be 2');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function closingHook(data) {
    equal(data.elementValue, '!', 'object containing string value hook key 3');
    equal(sequence, 5, 'Our execution sequence should be 5');
    ok(ready, 'Ready should be true');
    start();

  }

  function fireWhenReady(data) {
    equal(data.join('-'), '5-6-7', 'Array of numbers value hook');
    equal(sequence, 4, 'Our execution sequence should be 4');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  server.hook('multiplier', multiplier, 500);
  server.hook('writeOutput', writeOutput, 20);
  server.hook('paintWorld', paintWorld, 50);
  server.hook('paintReadyExclamation', closingHook, 10, true);
  server.hook('fireWhenReady', fireWhenReady, 2, true);

  server.run(getParams(), true);

  // trigger ready event
  ready = true;
  server.ready();

});


test('More to come mode', function(){
  expect( 36 );

  stop();

  var server = ss.server.Server2jsClass();

  // priority tracker
  var sequence = 1;
  // ready fired
  var ready = false;

  function multiplier(data)
  {
    strictEqual(data, 10, 'multiplier - numeric value hook');
    equal(sequence, 3, 'Our execution sequence should be 3');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function writeOutput(data)
  {
    strictEqual(data, true, 'writeOutput - boolean value hook');
    equal(sequence, 1, 'Our execution sequence should be 1');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function eagerLoaded(data)
  {
    equal(data, 'fun', 'eagerLoaded - string moreToCome value hook');
    equal(sequence, 4, 'Our execution sequence should be 4');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }
  function lazyLoaded(data)
  {
    equal(data, 'more fun', 'lazyLoaded - string moreToCome value hook');
    equal(sequence, 5, 'Our execution sequence should be 5');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }


  function paintWorld(data)
  {
    equal(data.elementId, 'helloWorld', 'paintWorld - object containing string value hook key 1');
    equal(data.elementValue, ' World', 'paintWorld - object containing string value hook key 2');
    equal(sequence, 2, 'Our execution sequence should be 2');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function notSoClosingHook(data)
  {
    equal(data.elementValue, '!', 'notSoClosingHook - object containing string value hook key 3');
    equal(sequence, 7, 'Our execution sequence should be 7');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  function fireWhenReady(data)
  {
    equal(data.join('-'), '5-6-7', 'fireWhenReady - Array of numbers value hook');
    equal(sequence, 6, 'Our execution sequence should be 6');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  function lazyLoadedReady(data)
  {
    equal(data, 'and more fun', 'lazyLoadedReady - string moreToCome value hook');
    equal(sequence, 8, 'Our execution sequence should be 8');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  // When the third (and last) server call is made, ready has fired
  // and we have two hooks ready to run. One is 'eagerFoo' which is a 'synch'
  // hook and the other is eagerFooReady which is a 'ready' hook
  // Rule is, a synch hook always takes precedence over a ready hook
  function eagerFoo(data)
  {
    equal(data, 'foo fun', 'eagerFoo - string moreToCome value hook');
    equal(sequence, 9, 'Our execution sequence should be 9');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  function eagerFooReady(data)
  {
    equal(data, 'poo fun', 'eagerFooReady - string moreToCome value hook');
    equal(sequence, 10, 'Our execution sequence should be 10');
    ok(ready, 'Ready should be true');
    sequence++;
  }

  function lazyFooReady(data)
  {
    equal(data, 'lazy poo fun', 'lazyFooReady - string moreToCome value hook');
    equal(sequence, 11, 'Our execution sequence should be 11');
    ok(ready, 'Ready should be true');
    // end of the line
    start();

  }

  server.hook('multiplier', multiplier, 500);
  server.hook('writeOutput', writeOutput, 20);
  server.hook('paintWorld', paintWorld, 50);
  server.hook('paintReadyExclamation', notSoClosingHook, 10, true);
  server.hook('fireWhenReady', fireWhenReady, 2, true);

  // the hooks from moreToCome server calls
  server.hook('eagerLoaded', eagerLoaded, 10);
  server.hook('eagerFoo', eagerFoo, 55);
  server.hook('eagerFooReady', eagerFooReady, 15, true);

  // run run run
  server.run(getParams(true));

  // now call server with a few additional instructions
  var moreInstructs = encodeParams([
    {op: 'eagerLoaded', val: 'fun'},
    {op: 'lazyLoaded', val: 'more fun'},
    {op: 'lazyLoadedReady', val: 'and more fun'}
  ]);
  server.run(moreInstructs, true);

  // lazily attach hooks
  server.hook('lazyLoaded', lazyLoaded);
  server.hook('lazyLoadedReady', lazyLoadedReady, 14, true);

  // trigger ready event
  ready = true;
  server.ready();

  // now call server with a few additional instructions
  var evenMoreInstructs = encodeParams([
    {op: 'eagerFoo', val: 'foo fun'},
    {op: 'eagerFooReady', val: 'poo fun'},
    {op: 'lazyFooReady', val: 'lazy poo fun'}
  ]);
  server(evenMoreInstructs, true);

  server.hook('lazyFooReady', lazyFooReady, 1, true);

  ok(server.dispose(), 'dispose() should return true');
  ok(!server.dispose(), 'second call to dispose() should return false');

});

test('Edge cases', function() {
  expect( 12 );

  stop();

  var server = ss.server.Server2jsClass();

  // priority tracker
  var sequence = 1;
  // ready fired
  var ready = false;

  function multiplier(data)
  {
    strictEqual(data, 10, 'numeric value hook');
    equal(sequence, 4, 'Our execution sequence should be 3');
    ok(!ready, 'Ready should not be true');
    // end of the road
    start();
  }

  function writeOutput(data)
  {
    strictEqual(data, true, 'boolean value hook');
    equal(sequence, 1, 'Our execution sequence should be 1');
    ok(!ready, 'Ready should not be true');
    sequence++;
  }

  function falseFunc()
  {
    ok(false, 'falseFunc function should never be called');
    start();
  }

  // paintHello will be called twice from the server
  function paintHello(data)
  {
    // Which server hook are we?
    switch(data.elementId) {
      case 'helloWorld':
        // first one...
        equal(sequence, 2, 'Our execution sequence should be 2');
        ok(!ready, 'Ready should not be true');
        sequence++;
      break;
      case 'doubleHello':
        equal(sequence, 3, 'Our execution sequence should be 3');
        ok(!ready, 'Ready should not be true');
        sequence++;
      break;
      default:
        ok(false, 'Bogus hook call');
        start();
      break;
    }
  }

  server.hook('multiplier', multiplier, 500);
  // a second hook on the same operation will not trigger
  server.hook('multiplier', falseFunc, 510);
  server.hook('writeOutput', writeOutput, 1);
  server.hook('paintHello', paintHello, 5);
  server.hook('notExists', falseFunc, 50);
  server.hook('paintReadyExclamation', falseFunc, 10, true);
  server.hook('fireWhenReady', falseFunc, 2, true);

  // use native array and alias name
  server(getParams(), true);
  // when .ready() has not executed, while we have ready hooks
  // auto-dispose will not happen...
  ok(server.dispose(), 'dispose should return true');
  ok(!server.dispose(), 'dispose should return false');

  // never call ready events

});
