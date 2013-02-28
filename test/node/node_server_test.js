var server2js = require('../../lib/server2js.node'),
    fixtures = require('../fixtures/dataObjects.fixture'),
    grunt = require('grunt');

var req = {};

var expected = 'test/expected/',
    tmp      = 'temp/';


/**
 * [fillServer2js description]
 * @param  {[type]} serv [description]
 * @return {[type]}      [description]
 */
function fillServer2js( req, serv ) {
    serv.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);
    serv.add(req, fixtures.data.scriptTag.op, fixtures.data.scriptTag.val);
    serv.add(req, fixtures.data.objectCase.op, fixtures.data.objectCase.val);
    serv.add(req, fixtures.data.oddCase.op, fixtures.data.oddCase.val);
}

exports['server2js.node'] = {

  'check clear works': function(test) {
    req = {};
    test.expect(1);
    server2js.add(req, fixtures.data.booleanCase.op, fixtures.data.booleanCase.val);

    server2js.clear(req);

    test.equal(server2js.getEncString(req), '', 'Should be empty');
    test.done();

  },

  'add and get raw string': function(test) {
    test.expect(1);
    req = {};
    var actualFile = 'rawscript.js';

    fillServer2js(req, server2js);

    grunt.file.write( tmp + actualFile, server2js.getEncString(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture encoded string: ' + actualFile);

    test.done();
  },

  'add and get complete snippet': function(test) {
    test.expect(1);
    req = {};
    var actualFile = 'completeSnippet.js';

    fillServer2js(req, server2js);

    grunt.file.write( tmp + actualFile, server2js.getSnippet(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture endResult: ' + actualFile);

    test.done();
  },

  'add and get complete snippet including script tags': function(test) {
    test.expect(1);
    var actualFile = 'completeSnippetScript.html';
    req = {};
    fillServer2js(req, server2js);

    grunt.file.write( tmp + actualFile, server2js.getScript(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'should output expected fixture scriptResult: ' + actualFile);
    test.done();
  },

  'User data object with a single quote case': function(test) {
    test.expect(1);
    var actualFile = 'user.html';
    req = {};
    server2js.clear(req);
    server2js.add(req, fixtures.data.user.op, fixtures.data.user.val);

    grunt.file.write( tmp + actualFile, server2js.getScript(req));

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'task output should equal: ' + actualFile);
    test.done();
  },

  'web test file': function(test) {
    test.expect(1);
    var actualFile = 'testOnWeb.js';
    req = {};
    fillServer2js(req, server2js);

    var out = 'var fixtures = fixtures || {};\n';
    out += 'fixtures.hotFromNode = ' + server2js.getEncString(req) + ';\n';

    grunt.file.write( tmp + actualFile, out);

    var actual = grunt.file.read(tmp + actualFile);
    var expect = grunt.file.read(expected + actualFile);

    test.equal(actual, expect, 'task output should equal: ' + actualFile);
    test.done();
  }

};


