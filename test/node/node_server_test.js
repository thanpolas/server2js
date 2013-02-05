var server2js = require('../../node/server2js.node');

var fixtures = require('../fixtures/dataObjects.fixture');
exports['server2js.node'] = {
  setUp: function(cb) {
    server2js.clear();
    cb();
  },
  'check clear works': function(test) {
    test.expect(1);
    server2js.add(fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);

    server2js.clear();

    test.equal(server2js.getString(), '', 'Should be empty');
    test.done();

  },
  'add and get raw string': function(test) {
    test.expect(1);
    server2js.add(fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    test.equal(server2js.getString(), fixtures.jsonEnc, 'should output expected fixture encoded string');
    test.done();
  },
  'add and get complete snippet': function(test) {
    test.expect(1);
    server2js.add(fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    test.equal(server2js.getSnippet(), fixtures.endResult, 'should output expected fixture endResult');
    test.done();
  },
  'add and get complete snippet including script tags': function(test) {
    test.expect(1);
    server2js.add(fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    test.equal(server2js.getScript(), fixtures.scriptResult, 'should output expected fixture scriptResult');
    test.done();

  }

};


