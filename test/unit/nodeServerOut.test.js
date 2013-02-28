(function() {
  module('testing node script output on the web');


  test('Should parse the node output and not throw an error', function() {
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    server2js( fixtures.hotFromNode );
    ok(true, 'no error thrown');
  });
  test('Should parse the node output and return true', function() {
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    ok(server2js( fixtures.hotFromNode ), 'parsing the string should return true');
  });

  test('Should provide the boolean case as is', function(){
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    stop();
    server2js.hook(fixtures.data.booleanCase.op, function( data ) {
      strictEqual( fixtures.data.booleanCase.val, data, 'Should exactly match the original value');
      start();
    });
    server2js( fixtures.hotFromNode );
  });

  test('Should provide the scriptTag case as is', function(){
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    stop();
    server2js.hook(fixtures.data.scriptTag.op, function( data ) {
      strictEqual( data, fixtures.data.scriptTag.val, 'Should exactly match the original value');
      start();
    });
    server2js( fixtures.hotFromNode );
  });

  test('Should provide the object case as is', function(){
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    stop();
    server2js.hook(fixtures.data.objectCase.op, function( data ) {
      deepEqual( data, fixtures.data.objectCase.val, 'Should exactly match the original value');
      start();
    });
    server2js( fixtures.hotFromNode );
  });

  test('Should provide the oddcase case as is', function(){
    var server2js = ss.server.Server2jsClass();
    expect( 1 );
    stop();
    server2js.hook(fixtures.data.oddCase.op, function( data ) {
      strictEqual( fixtures.data.oddCase.val, data, 'Should exactly match the original value');
      start();
    });
    server2js( fixtures.hotFromNode );
  });

}).call(this);
