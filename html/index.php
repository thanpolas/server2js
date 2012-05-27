<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Server to JS</title>
</head>
<body>
<h1>Server to JS Interface</h1>

<div id="helloWorld"></div>
<div id="output"></div>
<a href="/compiled.php">View Compiled version</a>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script src="/js/closure-library/closure/goog/base.js"></script>
<script src="/js/deps.js"></script>
<script src="/js/server2js/server2js.js"></script>
<script src="/js/example/main.js"></script>
<script>
	example.init();
</script>

<?php
	$sendToJs = Array();

  array_push($sendToJs, Array(
    'nameId' => 'paintWorld',
    'value' => Array(
      'elementId' => 'helloWorld',
      'elementValue' => ' World'
      )
  ));
  array_push($sendToJs, Array(
    'nameId' => 'multiplier',
    'value' => 10
  ));
  array_push($sendToJs, Array(
    'nameId' => 'writeOutput',
    'value' => true
  ));
  array_push($sendToJs, Array(
    'nameId' => 'paintHello',
    'value' => Array(
      'elementId' => 'helloWorld',
      'elementValue' => 'Hello'
      )
  ));
  array_push($sendToJs, Array(
    'nameId' => 'paintReadyExclamation',
    'value' => Array(
      'elementId' => 'helloWorld',
      'elementValue' => '!'
      )
  ));

  $sendToJsJSON = json_encode($sendToJs);
?>
<script>
(function(server){
  var dataInput = <?php echo $sendToJsJSON; ?>;

  server(dataInput);

})(ss.server2js.server);
</script>

</body>
</html>