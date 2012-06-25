# server2.js

Server to JS is a hook based interface between your server and your JS application.

* **Tiny** server2.js is only 2,659 bytes (1,078 bytes gzipped).
* **Hook based** Hook and listen for server calls from anywhere in your JS application.
* **Prioritized** Control the sequence of hook execution.
* **Synchronous** Execution of hooks is synchronous. As soon as server passes the data object, hooks are executed! Fast!
* **Ready Option** Optionally you may trigger a hook on a `Ready` event that you define.
* **GC OK!** When everything is done server2.js will delete all references to the data objects used. Happy Garbage Collection!

## Quick start

[Get the latest version (1.1.2)](https://github.com/thanpolas/server2js/raw/master/dist/server2.min.js).

[Or check out the source](https://github.com/thanpolas/server2js/blob/master/source/server2.js).

## Documentation
### Server API

To interface with your JS codebase you need to create an **array of objects**. The objects need to contain two keys `op` and `val`. Then execute `ss.server()`. `op` stands for *operation*, a string to use when attaching hooks in JS. `val` is *value* and can be any type.

```javascript
ss.server(serverDataObject [, moreToCome]);
```

Parameter `serverDataObject` can be an Array of objects, as mentioned above or a JSON encoded string of the same type.

```javascript
var allData = [
  {op: 'operation1', val: {modId:1, conf:'stay'/* any type will do */}},
  {op: 'operation2', val: true},
  {op: 'operation1', val: {modId:2, conf:'go'}/* op can be used multiple times by the server */}
  ];
// Pass your array to server2.js
ss.server(allData);
```

*The `ss.server()` method is an alias to the `ss.server.run()` method.*

#### Beware of Disposing!

By default we expect a single call to the `ss.server()` method. When that call is made, and after every attached hook has been executed, **server2.js automatically disposes** all it's internal references to data objects, in hopes of helping the JS Garbage Collector clean up. 

This action, in effect, **destroys the instance**, making it totally unusable to any further calls. There are two ways to avoid or circumvent this behavior:

  1. Set the second parameter (`moreToCome`) of the `ss.server()` method to `true`. This will instruct server2.js to not automatically dispose, and wait for additional hooks to attach or server calls to be made. In this case, be kind enough to call the [ss.server.dispose()](https://github.com/thanpolas/server2js#the-dispose-method) method when appropriate.
  2. Create a new server2.js instance. This solution is not really recommended, however [the ability exists](https://github.com/thanpolas/server2js#the-class).
  
**Important Note** When calling `ss.server()` multiple times, you have to use the `moreToCome` switch **every time** or automatic disposal will kick in!

### Javascript API

#### The hook() Method

Your modules can hook to server2.js using the `ss.server.hook()` method.

```javascript
ss.server.hook(op, fn [,priority, onReady]);
```

Example:

```javascript
ss.server.hook('operation1', function(data){
  if(1 == data.modId) {
    /* Do stuff */
  } else {
    /* Do other stuff */
  }
});
```

The two optional parameters for `ss.server.hook` are:

  * `priority {number=}` Set priority of execution for your hook. By default all hooks have a priority of 100, the smaller the priority the sooner the hook will execute.
  * `onReady {boolean=} ` All hooks execute synchronously. Meaning, the moment `ss.server2js.server()` is executed, all hooks trigger. With `onReady` you have the option to execute the hook on a *ready* event, whatever that means to you (DOM Ready or your logic).

#### The ready() Method

Because server2.js is agnostic of the meaning of a 'Ready Event' you have to trigger it yourself:

```javascript
  ss.server.ready();
```

So if you use jQuery:

```javascript
// assume we use jQuery
$().ready(function(){
  // trigger all onReady hooks
  ss.server.ready();
});
```

#### The dispose() Method

In the case when you instructed server2.js to not auto-dispose, `ss.server.dispose()` is the method to call for manual disposing the references to the contained data objects. `dispose()` returns a boolean value for success or failure.

```javascript
ss.server.dispose();
```

**Important Note** After calling this method, the server2.js instance will be destroyed and will no longer be usable.

#### The Class

`ss.server` is a singleton instance of the ss.Server2js class. If for any reason you need to create another instance you can access the constructor at `ss.server.Server2jsClass`.

```javascript
// get a new instance of Server2js - no 'new' keyword please
var iOnlyUseThisForTesting = ss.server.Server2jsClass();
```

## Order Matters!

The order of loading the scripts matters.

  1. First load `server2.js`
  2. Then all your scripts
  3. Last echo your server's Array and execute the `ss.server()`
  4. If you have onReady hooks, remember to trigger the ready event `ss.server.ready()`

## More Examples

For more complex configurations check out [the tests](https://github.com/thanpolas/server2js/blob/master/test/unit/server2js.test.js). 

### Your html

The html file as served by your server:

```html
<!DOCTYPE html>
<html>
<head>
<title>Server to JS</title>
</head>
<body>
<h1>Server to JS Interface</h1>

<div id="helloWorld"></div>
<div id="output"></div>

<!-- Content here -->

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script type="text/javascript" src="js/server2js.min.js"></script>
<script type="text/javascript" src="js/awesomeApp.js"></script>
<script type="text/javascript" src="js/awesomeController.js"></script>
<script type="text/javascript">

  var dataInput = '[{"nameId":"paintWorld","value":{"elementId":"helloWorld","elementValue":" World"}},{"nameId":"paintHello","value":{"elementId":"helloWorld","elementValue":"Hello"}},{"nameId":"writeOutput","value":true},{"nameId":"multiplier","value":10},{"nameId":"paintReadyExclamation","value":{"elementId":"helloWorld","elementValue":"!"}}]';

  /**
   * The above JSON String expanded as a JS native array:

  [
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
    }
  ];

  */

  ss.server(dataInput);

</script>
</body>
</html>
```

### The awesomeApp.js

```javascript
// setup our namespace
window.awesome = window.awesome || {};
window.awesome.app = window.awesome.app || {};

/** @type {number} Out multiplier */
awesome.app.multiplier = NaN;

/**
 * Hook to server2.js on init (called in the end of this file)
 *
 */
awesome.app.init = function()
{
    ss.server.hook('multiplier', awesome.app.setMultiplier);
};

/**
 * Get an element by its ID
 * @param {string} elementId the element's ID
 * @return {Element}
 */
awesome.app.getElement = function(elementId)
{
  return document.getElementById(elementId);
};

/**
 * @param {number} num
 * @return {number}
 */
awesome.app.times = function(num)
{
  return num * awesome.app.multiplier;
};

/**
 * Simple setter for multiplier
 *
 * @param {number} num
 * @return {void}
 */
awesome.app.setMultiplier = function(num)
{
  awesome.app.multiplier = num;
};

// synchronously execute our init
(function(){
  awesome.app.init();
})();
```

### The awesomeController.js

```javascript
// setup our namespace
window.awesome = window.awesome || {};
window.awesome.controller = window.awesome.controller || {};

/**
 * Attach all needed hooks to server2.js
 *
 * Fires up synchronously in the end of this file
 */
awesome.controller.init = function()
{
  // Hook to paintWorld with default priority (100)
  ss.server.hook('paintWorld', awesome.controller.paintWord);

  // Hook to paintHello, because we want to execute paintHello
  // before paintWorld, we set the priority to 50
  ss.server.hook('paintHello', awesome.controller.paintWord, 50);

  // Finally, when Hello World is painted, add an exclamation mark
  // when our DOM is ready
  ss.server.hook('paintReadyExclamation', awesome.controller.paintWord, 100, true);

  // And do some stuff when DOM is ready and AFTER 'paintReadyExclamation' is
  // executed
  ss.server.hook('writeOutput', awesome.controller.doMoreStuff, 110, true);
};

/**
 * Change the html of an element as per server's instructions
 *
 * @param {Object.<string, string>} data
 * @return {void}
 */
awesome.controller.paintWord = function(data)
{
  // get the DOM element based on the server instructions
  var el = awesome.app.getElement(data['elementId']);

  // Append whatever the server told us to
  el.innerHTML = el.innerHTML + data['elementValue'];
};

/**
 * Do more stuff
 *
 * @param {boolean} data
 * @return {void}
 */
awesome.controller.doMoreStuff = function(data)
{
  // data expected from the server is boolean type
  if (!data) {
    return;
  }

  // server gave us the go ahead, get the output element
  var el = awesome.app.getElement('output');

  // do some calculations
  var output = 'The result of 4 times ' + awesome.app.multiplier + ' is: ' + awesome.app.times(4);

  // output the result
  el.innerHTML = output;
};

// Synchronously execute our init and listen for the DOM ready event
(function(){
  // attach all hooks
  awesome.controller.init();

  // Listen for the DOM ready event and trigger server2.js ready event
  $().ready(function(){
    // trigger all onReady hooks
    ss.server.ready();
  });
})(jQuery);
```