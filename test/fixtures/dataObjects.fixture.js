
var fixtures = fixtures || {};


fixtures.data = {
  booleanCase: {op: 'booleanCase', val: true},
  scriptTag: {op: 'scriptTag', val: '<script>eval("\'evil!\'");</script>'},
  objectCase: {op: 'objectCase', val: {name: 'Thanasis', username: 'thanpolas', isadork: true}},
  oddCase: {op: 'oddCase', val: 'a single \' quot\\e \\\\ \" "\"" and "" and "" a !@#$%^&*()_+][[]]<>?":;`~§±,./" \!\@\#\$\%\^\&\*\(\)\_\+\]\[\[\]\]\<\>\?\"\:\;\`\~\§\±\,\.\/\"\ \\?":;`~§±,./" back \\ run'},
  user: {
    op: 'udo',
    val: {
      user_id: '43710355087728826877',
      first_name: 'than polas\'z',
      country: 'US',
      conversations: 0
    }
  }
};


fixtures.arrayLiteral = [
  {op: 'booleanCase', val: true},
  {op: 'scriptTag', val: '<script>eval("\'evil!\'");</script>'},
  {op: 'objectCase', val: {name: 'Thanasis', username: 'thanpolas', isadork: true}},
  {op: 'oddCase', val: 'a single \' quote to mark " and "" and "" a back \\ run'}
];

fixtures.arrayEscaped = [
  {op: 'booleanCase', val: 'true'},
  {op: 'scriptTag', val: '&quot;&lt;script&gt;eval(\\&quot;\'evil!\'\\&quot;);&lt;/script&gt;&quot;'},
  {op: 'objectCase', val: '{&quot;name&quot;:&quot;Thanasis&quot;,&quot;username&quot;:&quot;thanpolas&quot;,&quot;isadork&quot;:true}'},
  {op: 'oddCase', val: '&quot;a single \' quote to mark \\&quot; and \\&quot;\\&quot; and \\&quot;\\&quot; a back \\\\ run&quot;'}
];

fixtures.jsonEnc = '[{\"op\":\"booleanCase\",\"val\":\"true\"},{\"op\":\"scriptTag\",\"val\":\"&quot;&lt;script&gt;eval(\\\\&quot;\'evil!\'\\\\&quot;);&lt;/script&gt;&quot;\"},{\"op\":\"objectCase\",\"val\":\"{&quot;name&quot;:&quot;Thanasis&quot;,&quot;username&quot;:&quot;thanpolas&quot;,&quot;isadork&quot;:true}\"},{\"op\":\"oddCase\",\"val\":\"&quot;a single \' quote to mark \\\\&quot; and \\\\&quot;\\\\&quot; and \\\\&quot;\\\\&quot; a back \\\\\\\\ run&quot;\"}]';

fixtures.endResult = '// <![CDATA[\n' + 'ss.server(\'' + fixtures.jsonEnc +
  '\');\n' + '// ]]>\n';

fixtures.scriptResult = '<script type="text/javascript">' + fixtures.endResult + '</script>';

// the whole json string is broken
fixtures.breakingJSON ='[/{"""""{}{}{}ot;:true,&quot;nestedViews&quot;:false}"}]';

// an item inside the operations is broken
fixtures.breakingJSONitem ='[{"op":"udo","val":"I\'m Eric."},{"op":"features","val":"{&quot;handlebars&quot;:true,&quot;nestedViews&quot;:false}"}]';

if ( 'object' === typeof exports && exports ) {
  module.exports = exports = fixtures;
}
