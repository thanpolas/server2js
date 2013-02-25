
exports.data = {
  booleanCase: {op: 'booleanCase', val: true},
  scriptTag: {op: 'scriptTag', val: '<script>eval("\'evil!\'");</script>'},
  objectCase: {op: 'objectCase', val: {name: 'Thanasis', username: 'thanpolas', isadork: true}},
  oddCase: {op: 'oddCase', val: 'a single \' quote to mark " and "" and "" a back \\ run'},
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


exports.arrayLiteral = [
  {op: 'booleanCase', val: true},
  {op: 'scriptTag', val: '<script>eval("\'evil!\'");</script>'},
  {op: 'objectCase', val: {name: 'Thanasis', username: 'thanpolas', isadork: true}},
  {op: 'oddCase', val: 'a single \' quote to mark " and "" and "" a back \\ run'}
];

exports.arrayEscaped = [
  {op: 'booleanCase', val: 'true'},
  {op: 'scriptTag', val: '&quot;&lt;script&gt;eval(\\&quot;\'evil!\'\\&quot;);&lt;/script&gt;&quot;'},
  {op: 'objectCase', val: '{&quot;name&quot;:&quot;Thanasis&quot;,&quot;username&quot;:&quot;thanpolas&quot;,&quot;isadork&quot;:true}'},
  {op: 'oddCase', val: '&quot;a single \' quote to mark \\&quot; and \\&quot;\\&quot; and \\&quot;\\&quot; a back \\\\ run&quot;'}
];

exports.jsonEnc = '[{\"op\":\"booleanCase\",\"val\":\"true\"},{\"op\":\"scriptTag\",\"val\":\"&quot;&lt;script&gt;eval(\\\\&quot;\'evil!\'\\\\&quot;);&lt;/script&gt;&quot;\"},{\"op\":\"objectCase\",\"val\":\"{&quot;name&quot;:&quot;Thanasis&quot;,&quot;username&quot;:&quot;thanpolas&quot;,&quot;isadork&quot;:true}\"},{\"op\":\"oddCase\",\"val\":\"&quot;a single \' quote to mark \\\\&quot; and \\\\&quot;\\\\&quot; and \\\\&quot;\\\\&quot; a back \\\\\\\\ run&quot;\"}]';

exports.endResult = '// <![CDATA[\n' + 'ss.server(\'' + exports.jsonEnc +
  '\');\n' + '// ]]>\n';

exports.scriptResult = '<script type="text/javascript">' + exports.endResult + '</script>';
