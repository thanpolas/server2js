var server2js = require('../../lib/server2js.node');

var fixtures = require('../fixtures/dataObjects.fixture');

var req = {};

exports['server2js.node'] = {
  setUp: function(cb) {
    server2js.clear(req);
    cb();
  },
  'check clear works': function(test) {
    test.expect(1);
    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);

    server2js.clear(req);

    test.equal(server2js.getEncString(req), '', 'Should be empty');
    test.done();

  },
  'add and get raw string': function(test) {
    test.expect(1);
    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    test.equal(server2js.getEncString(req), fixtures.jsonEnc, 'should output expected fixture encoded string');
    test.done();
  },
  'add and get complete snippet': function(test) {
    test.expect(1);
    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);
    test.equal(server2js.getSnippet(req), fixtures.endResult, 'should output expected fixture endResult');
    test.done();
  },
  'add and get complete snippet including script tags': function(test) {
    test.expect(1);
    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    test.equal(server2js.getScript(req), fixtures.scriptResult, 'should output expected fixture scriptResult');
    test.done();

  }

};


