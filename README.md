# server2.js

Transfer data objects from server to javascript on page load.

## Summary

The scenario:

1. Browser requests a page
2. Server does its stuff, prepares a response and wants to **pass data** to the Javascript application on page load.
3. Server renders the page and [passes the data](#prepering-the-data-on-the-server) to the javascript application using the document itself.
4. Javascript initializes, `server2.js` kicks in, parses the data and [calls](#the-hook-method) the listeners

You can also read [a more detailed blog post](http://thanpol.as/javascript/passing-data-from-server-to-javascript-on-page-load) about this technique.

**Server.js is:**

* **Tiny** Only ~2.2kb (~1kb gzipped).
* **Hook based** Hook and listen for server calls from anywhere in your JS application.
* **Safe** Input is expected to be an HTML escaped string.
* **Prioritized** Control the sequence of hook execution.
* **Synchronous** Execution of hooks is synchronous. As soon as server passes the data object, hooks are executed! Fast!
* **Ready Option** Optionally you may trigger a hook on a `Ready` event that you define.
* **GC OK!** When everything is done server2.js will delete all references to the data objects used. Happy Garbage Collection!

## Quick start

[Download the latest version (0.2.1)](https://github.com/thanpolas/server2js/raw/master/dist/server2.min.js).

A server package has been implemented for nodeJS, install with npm:

```shell
npm install server2js
```

Read the [server documentation](#server-documentation) for API details.

## Requirements

server2js for the browser depends on the `JSON` global so it can properly parse JSON strings.


## Front End Documentation

### Prepering The Data on The Server

To interface with your JS application, your server needs to convert all the data to be passed into an **HTML escaped JSON String**.

To pass the instructions and data to your JS app all you need to do is call `ss.server()`:

```javascript
ss.server(HTMLescapedString [, autoDispose]);
```

Read more about the optional boolean autoDispose argument in the [Dispose section](#the-autoDespose-argument).

A server side implementation in imaginary JS code would be like this:
```javascript
/**
 * Your imaginary server side implementation...
 *
 */

var myServer = {};
myServer.server2js = {};

var dataQueue = [];
// add an operation to be passed to the client
myServer.server2js.add function( operation, data ) {
  dataQueue.push({op: operation, val: data});
}

// get
myServer.server2js.get = function() {
  var out = JSON.stringify(dataQueue);
  out = HTMLescape(out);
  return 'ss.server("' + out + '");
}
```
Each operation is an object that contain two keys `op` and `val`. `op` stands for *operation*, a string to use for attaching hooks in JS. `val` is *value* and can be any type.

You push this object into an array, and that's all you need to do for input. For output you need to JSON encode the array and HTML escape it before you wrap it in the server2js call.

When using this implemention this is how your code would look like:
```js
/**
 * Using your server side implementation
 *
 */

// Check if user is authenticated and inform the JS App
if (user.isAuthed()) {
  myServer.server2js.add('isAuthed', true);
  // pass the user data object too
  myServer.server2js.add('user', user.getAll());
} else {
  myServer.server2js.add('usAuthed', false);
}

/* ... */

// pass environment data to the client
myServer.server2js.add('env', {
  env: 'live',
  server: 'server01',
  serverTime: 1360067536
});

```

And the end of the lifecycle is to output everything to the document, so in your template you would do something like this:
```html
<!-- At the bottom of the document, after the server2js file and before your code -->
<script>
<% myServer.server2js.get(); %>
</script>
```

### Javascript API

#### The hook() Method

Your modules can hook to server2.js using the `ss.server.hook()` method.

```javascript
ss.server.hook(op, fn [,priority, onReady]);
```

Example:

```javascript
ss.server.hook('operation1', function(data){
  if('live' == data.env) {
    /* We are on live */
  } else {
    /* We are on development */
  }
});
```

The two optional parameters for `ss.server.hook` are:

  * `priority {number=}` Set priority of execution for your hook. By default all hooks have a priority of 100, the smaller the priority the sooner the hook will execute.
  * `onReady {boolean=} ` All hooks execute synchronously. Meaning, the moment `ss.server2js()` is executed, all hooks trigger. With `onReady` you have the option to execute the hook on a *ready* event, whatever that means to you (DOM Ready or your logic).

**BEWARE** You can only assign one hook per operation. Once the hook has been invoked server2js will automatically destroy the internal reference to the data and will ignore any other hooks for the same operation. It is your application's job to share the *light* to all the components that need it.

**KEEP NOTE** Typically, if you define the server data object before you create your hooks, when your hooks are created they are invoked right there and then synchronously.

#### The ready() Method

Because server2.js is agnostic of the meaning of a 'Ready Event' you have to trigger it yourself like so:

```javascript
  ss.server.ready();
```

So if you use jQuery:

```javascript
// Pass UI related information from the server when DOM is Ready
$().ready(function(){
  // trigger all onReady hooks
  ss.server.ready();
});

// which could also be written as
$(ss.server.ready);
```

#### The dispose() Method

The default flow is to invoke the `ss.server()` command before you create any hooks. Therefore there is no way to know when you have finished collecting the data objects passed. There is also the possibility that not all data passed by the server are called for by the client leaving these data hanging in memory.

Therefore it is advisable to invoke the `dispose()` method after you have finished all your server2js operations on the frontend:

```javascript
ss.server.dispose();
```

**Important Note** After calling this method, the server2.js instance will be destroyed and will no longer be usable.

##### The autoDespose Argument
As illustrated in the API call for the server there is an `autoDispose` argument:
```js
ss.server(HTMLescapedString [, autoDispose]);
```

This argument is an optional boolean. It's job is to invoke the `dispose()` method. It is useful in a different flow of your app, where you invoke it **after** your app has initialized and attached hooks to server2js. Your flow would look like this:

1. Load server2.js script file.
2. Load your application, attach hooks on server2js
3. Invoke `ss.server(jsonData, true);` to synchronously call all hooks and auto dispose.

#### About The Class

`ss.server` is a singleton instance of the ss.Server2js class. If for any reason you need to create another instance you can access the factory constructor at `ss.server.Server2jsClass`.

```javascript
// get a new instance of Server2js - no 'new' keyword please
var iOnlyUseThisForTesting = ss.server.Server2jsClass();
```

## Order Matters!

The order of loading the scripts matters.

  1. Load `server2.js` along with any other libs you use (jQuery, ...).
  2. Server's call to `ss.server()` with all the **passed data objects**.
  3. Load your application, attach hooks on server2js.
  4. If you have onReady hooks, remember to trigger the [ready event](#the-ready-method) `ss.server.ready()`.

## More Examples

For more complex configurations check out [the tests](https://github.com/thanpolas/server2js/blob/master/test/unit/).

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
<script type="text/javascript">
  var dataInput = '[{"op":"paintWorld","val":{"elementId":"helloWorld","elementValue":" World"}},{"op":"paintHello","val":{"elementId":"helloWorld","elementValue":"Hello"}},{"op":"writeOutput","val":true},{"op":"multiplier","val":10},{"op":"paintReadyExclamation","val":{"elementId":"helloWorld","elementValue":"!"}}]';

  /**
   * The above JSON String expanded as a JS native array:

  [
    {
      op: 'paintWorld',
      val: {
        elementId: 'helloWorld',
        elementValue: ' World'
      }
    }, ... yadda yadda

   */

  ss.server(dataInput);
</script>
<script type="text/javascript" src="js/awesomeApp.js"></script>
<script type="text/javascript" src="js/awesomeController.js"></script>
</body>
</html>
```

### The awesomeApp.js

```javascript
// setup our namespace
var awesome = window.awesome = window.awesome || {};
awesome.app = awesome.app || {};

/** @type {number} Our multiplier */
awesome.app.multiplier = NaN;

// Hook to server2.js on init (called in the end of this file)
awesome.app.init = function() {
    ss.server.hook('multiplier', awesome.app.setMultiplier);
};

/**
 * Get an element by its ID
 * @param {string} elementId the element's ID
 * @return {Element}
 */
awesome.app.getElement = function(elementId) {
  return document.getElementById(elementId);
};

/**
 * @param {number} num
 * @return {number}
 */
awesome.app.times = function(num) {
  return num * awesome.app.multiplier;
};

/**
 * Simple setter for multiplier
 *
 * @param {number} num
 * @return {void}
 */
awesome.app.setMultiplier = function(num) {
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
var awesome = window.awesome = window.awesome || {};
awesome.controller = awesome.controller || {};

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

## Release History
- **v0.2.7**, *20 February 2013*
  - Added `get` method in the node API.
  - Several bug fixes on node API.

- **v0.2.1**, *05 February 2013*
  - New frontend API. Allows for declaration of server data object before hooks attach.
  - Added node.js server side component
  - Published on NPM


## License
Copyright (c) 2013 Thanasis Polychronakis
Licensed under the [APACHE2 license](http://www.apache.org/licenses/LICENSE-2.0).

