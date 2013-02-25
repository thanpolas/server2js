var server2js = require('../../lib/server2js.node'),
    fixtures = require('../fixtures/dataObjects.fixture'),
    grunt = require('grunt');

var req = {};

var expected = 'test/expected/',
    tmp      = 'temp/';


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

    var actualFile = 'rawscript.js';

    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    grunt.file.write( tmp + actualFile, server2js.getEncString(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture encoded string: ' + actualFile);

    test.done();
  },
  'add and get complete snippet': function(test) {
    test.expect(1);

    var actualFile = 'completeSnippet.js';

    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);

    grunt.file.write( tmp + actualFile, server2js.getSnippet(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture endResult: ' + actualFile);

    test.done();
  },
  'add and get complete snippet including script tags': function(test) {
    test.expect(1);
    var actualFile = 'completeSnippetScript.html';

    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    server2js.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    server2js.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    server2js.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);
    grunt.file.write( tmp + actualFile, server2js.getScript(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture scriptResult: ' + actualFile);
    test.done();
  },
  'User data object with a single quote case': function(test) {
    test.expect(1);
    var actualFile = 'user.html';

    server2js.add(req, fixtures.data.user.op, fixtures.data.user.val);
    grunt.file.write( tmp + actualFile, server2js.getScript(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'task output should equal: ' + actualFile);
    test.done();
  }

};


